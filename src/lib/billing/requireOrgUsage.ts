
import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import { requireOrg } from '@/lib/org/requireOrg'
import { PLAN_LIMITS } from './limits'
import { redirect } from 'next/navigation'
import { noStore } from 'next/cache'
import { stripe } from '@/lib/stripe/server'

type UsageKey = 'apiCalls' | 'aiTokens' | 'exports'

const STRIPE_METER_MAP: Record<UsageKey, string | undefined> = {
  apiCalls: process.env.STRIPE_METER_API_CALLS,
  aiTokens: process.env.STRIPE_METER_AI_TOKENS,
  exports: process.env.STRIPE_METER_EXPORTS,
};

export async function recordOrgUsage(
  key: UsageKey,
  amount = 1
) {
  noStore()

  const { orgId, org } = await requireOrg()
  const plan = org.plan

  // If there's no plan or subscription, block the action.
  if (!plan || !org.subscriptionStatus || !['active', 'trialing', 'past_due'].includes(org.subscriptionStatus)) {
    redirect('/billing')
  }

  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.[key] ?? 0;
  if (limit === Infinity) return; // Unlimited usage for this feature on this plan.

  const usageRef = adminDb.collection('orgUsage').doc(orgId)
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

  // Calculate the portion of this usage increment that is overage.
  const overageAmount = Math.max(0, newTotalUsage - limit) - Math.max(0, currentUsage - limit);

  const updatePayload: { [key: string]: any } = {
    [`usage.${key}`]: adminDb.FieldValue.increment(amount),
  };

  if (overageAmount > 0) {
    updatePayload[`overage.${key}`] = adminDb.FieldValue.increment(overageAmount);
  }

  await usageRef.update(updatePayload);

  // If there is an overage and we have a valid subscription item, report it to Stripe.
  if (overageAmount > 0 && org.subscriptionItemIds?.[key]) {
      try {
        await stripe.subscriptionItems.createUsageRecord(
            org.subscriptionItemIds[key],
            {
                quantity: overageAmount,
                timestamp: 'now', // Stripe can use 'now'
                action: 'increment',
            }
        );
      } catch (error) {
        console.error(`Failed to report usage to Stripe for org ${orgId}, key ${key}:`, error);
        // Depending on business logic, you might want to revert the Firestore increment here
        // or flag the organization for manual review. For now, we just log the error.
      }
  }

  // Optional: Implement a hard cap here if desired
  // const MAX_OVERAGE_LIMIT = 2000; // Example limit
  // if ((usageSnap.data()?.overage?.[key] ?? 0) + overageAmount > MAX_OVERAGE_LIMIT) {
  //   redirect('/billing?overage_cap=1');
  // }
}

    