
import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { requireOrg } from '@/lib/org/requireOrg';
import { PLAN_LIMITS } from './limits';
import { redirect } from 'next/navigation';
import { noStore } from 'next/cache';
import { stripe } from '@/lib/stripe/server';
import { consumeCredits } from './consumeCredits';
import { calculateCostInCents, type UsageKey } from './costs';

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

  const { orgId, org } = await requireOrg();
  const plan = org.plan;

  // If there's no plan or subscription, block the action.
  if (!plan || !org.subscriptionStatus || !['active', 'trialing', 'past_due'].includes(org.subscriptionStatus)) {
    redirect('/billing');
  }

  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.[key] ?? 0;
  if (limit === Infinity) return; // Unlimited usage for this feature on this plan.

  const usageRef = adminDb.collection('orgUsage').doc(orgId);
  const now = new Date();
  const periodEnd = org.currentPeriodEnd?.toDate();

  if (!periodEnd || periodEnd < now) {
    redirect('/billing');
  }
  
  const usageSnap = await usageRef.get();

  // Initialize or reset usage document if it's the start of a new billing period.
  if (!usageSnap.exists || usageSnap.data()?.periodEnd?.toDate() < now) {
    await usageRef.set({
      periodStart: now,
      periodEnd: periodEnd,
      usage: { apiCalls: 0, aiTokens: 0, exports: 0 },
      overage: { apiCalls: 0, aiTokens: 0, exports: 0 },
    }, { merge: true });
  }
  
  const currentUsage = usageSnap.data()?.usage?.[key] ?? 0;
  const newTotalUsage = currentUsage + amount;

  // Determine the portion of this usage increment that constitutes overage.
  const overageAmount = Math.max(0, newTotalUsage - limit) - Math.max(0, currentUsage - limit);

  // Atomically update the total usage in Firestore.
  await usageRef.update({
    [`usage.${key}`]: adminDb.FieldValue.increment(amount),
  });

  // If there is an overage, process it.
  if (overageAmount > 0) {
    const costInCents = calculateCostInCents(key, overageAmount);
    
    // Attempt to consume the cost from prepaid credits.
    const remainingCostInCents = await consumeCredits(orgId, costInCents);

    // If there's still a cost remaining after consuming credits, report it to Stripe.
    if (remainingCostInCents > 0) {
      // For Stripe, we need to convert the remaining cost back to usage units.
      const remainingOverageUnits = Math.ceil(remainingCostInCents / (calculateCostInCents(key, 1)));
      
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
