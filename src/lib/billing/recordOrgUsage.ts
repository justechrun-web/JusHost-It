
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
    } catch (error: any) {
      console.error(`Budget enforcement failed for org ${orgId}:`, error.message);
      // In a real app, you might redirect to a specific "cap reached" page.
      // For now, redirecting to billing is a safe default.
      redirect(`/billing?limit_reached=1&reason=${encodeURIComponent(error.message)}`);
    }
  }

  // The rest of the logic only applies to usage that has a defined limit (i.e., not unlimited)
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.[key] ?? 0;
  if (limit === Infinity) {
    // For business plan with unlimited usage, we still record the usage itself,
    // but without overage/credit logic.
    const usageRef = adminDb.collection('orgUsage').doc(orgId);
    await usageRef.set({
      [`usage.${key}`]: adminDb.FieldValue.increment(amount),
    }, { merge: true });
    return;
  }
  
  const usageRef = adminDb.collection('orgUsage').doc(orgId);
  const usageSnap = await usageRef.get();
  const currentUsage = usageSnap.data()?.usage?.[key] ?? 0;
  const newTotalUsage = currentUsage + amount;

  const overageAmount = Math.max(0, newTotalUsage - limit) - Math.max(0, currentUsage - limit);
  await usageRef.update({
    [`usage.${key}`]: adminDb.FieldValue.increment(amount),
  });

  if (overageAmount > 0) {
    const overageCostInCents = calculateCostInCents(key, overageAmount);
    
    // 3. Consume credits
    const remainingCostInCents = await consumeCredits(orgId, overageCostInCents);

    // 4. Check for auto-top if credits were used
    if (remainingCostInCents < overageCostInCents) {
        await checkAutoTopUp(orgId);
    }
    
    // 5. Report to Stripe if cost remains
    if (remainingCostInCents > 0) {
      const remainingOverageUnits = Math.ceil(remainingCostInCents / (calculateCostInCents(key, 1) || 1));
      
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
  }
}
