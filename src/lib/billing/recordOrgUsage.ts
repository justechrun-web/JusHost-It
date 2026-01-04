
'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireOrg } from '@/lib/org/requireOrg';
import { PLAN_LIMITS } from './limits';
import { redirect } from 'next/navigation';
import { noStore } from 'next/cache';
import { stripe } from '@/lib/stripe/server';
import { consumeCredits } from './consumeCredits';
import { calculateCostInCents, type UsageKey } from './costs';
import { checkAutoTopUp } from './checkAutoTopUp';
import { enforceBudgets } from './enforceBudgets';
import { detectAnomaly } from './detectAnomaly';
import { sendSlackAlert } from '../alerts/slack';
import { handleOverage } from './handleOverage';

/**
 * Records usage for an organization, applying it against prepaid credits first,
 * then reporting any remaining overage to Stripe for metered billing.
 *
 * @param key - The type of usage to record (e.g., 'apiCalls', 'aiTokens').
 * @param amount - The amount of usage to record. Defaults to 1.
 */
export async function recordOrgUsage(
  key: UsageKey,
  amount = 1
) {
  noStore();

  const { orgId, org, user } = await requireOrg();
  const plan = org.plan;

  if (!plan || !org.subscriptionStatus || !['active', 'trialing', 'past_due'].includes(org.subscriptionStatus)) {
    redirect('/billing');
  }

  // 1. Convert usage to cost
  const costInCents = calculateCostInCents(key, amount);

  if (costInCents > 0) {
    try {
      // 2. Enforce budgets (will throw if any cap is reached)
      await enforceBudgets({
        orgId,
        departmentId: user.departmentId,
        feature: key,
        cost: costInCents,
      });

      // 3. Anomaly detection (after budget enforcement)
      const anomaly = await detectAnomaly({ orgId, departmentId: user.departmentId, cost: costInCents });
      if (anomaly) {
        const deptSnap = user.departmentId ? await adminDb.collection('departments').doc(user.departmentId).get() : null;
        const slackWebhookUrl = deptSnap?.data()?.alerts?.slackWebhookUrl;
        if (slackWebhookUrl) {
            await sendSlackAlert(slackWebhookUrl, `🚨 *Spend Anomaly Detected*: ${anomaly.type} - Dept: ${deptSnap?.data()?.name || 'N/A'}, Feature: ${key}, Cost: $${(costInCents/100).toFixed(2)}`);
        }
      }

    } catch (error: any) {
      console.error(`Budget enforcement failed for org ${orgId}:`, error.message);
      redirect(`/billing?limit_reached=1&reason=${encodeURIComponent(error.message)}`);
    }
  }

  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.[key] ?? 0;
  const usageRef = adminDb.collection('orgUsage').doc(orgId);
  const usageSnap = await usageRef.get();
  const currentUsage = usageSnap.data()?.usage?.[key] ?? 0;
  const newTotalUsage = currentUsage + amount;
  
  await usageRef.set({
    [`usage.${key}`]: adminDb.FieldValue.increment(amount),
  }, { merge: true });

  const overageAmount = Math.max(0, newTotalUsage - limit) - Math.max(0, currentUsage - limit);

  if (overageAmount > 0) {
    const overageCostInCents = calculateCostInCents(key, overageAmount);
    
    const remainingCost = await consumeCredits(orgId, overageCostInCents);

    if(remainingCost > 0) {
        const overageDecision = await handleOverage({
            org,
            departmentId: user.departmentId,
            feature: key,
            cost: remainingCost,
            uid: user.id
        });

        if (overageDecision === 'pending') {
            const deptSnap = user.departmentId ? await adminDb.collection('departments').doc(user.departmentId).get() : null;
            const slackWebhookUrl = deptSnap?.data()?.alerts?.slackWebhookUrl;
             if (slackWebhookUrl) {
                await sendSlackAlert(slackWebhookUrl, `🚨 *Overage Approval Required*: Dept: ${deptSnap?.data()?.name || 'N/A'}, Feature: ${key}, Amount: $${(remainingCost/100).toFixed(2)} requested by ${user.email}`);
            }
            throw new Error(`Overage for ${key} requires approval.`);
        }
        
        // If 'allow', proceed to report to Stripe
        const remainingOverageUnits = Math.ceil(remainingCost / (calculateCostInCents(key, 1) || 1));
        await usageRef.update({
            [`overage.${key}`]: adminDb.FieldValue.increment(remainingOverageUnits),
        });

        if (org.subscriptionItemIds?.[key]) {
            try {
                await stripe.subscriptionItems.createUsageRecord(
                    org.subscriptionItemIds[key],
                    {
                        quantity: remainingOverageUnits,
                        timestamp: 'now',
                        action: 'increment',
                    }
                );
            } catch (error) {
                console.error(`Failed to report usage to Stripe for org ${orgId}, key ${key}:`, error);
            }
        }
    }
     
    // Check for auto-top up after credits are consumed
    await checkAutoTopUp(orgId);
  }
}

    