
import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import { requireOrg } from '@/lib/org/requireOrg'
import { PLAN_LIMITS } from './limits'
import { redirect } from 'next/navigation'
import { noStore } from 'next/cache'

type UsageKey = 'apiCalls' | 'aiTokens' | 'exports' | 'seats'

export async function requireOrgUsage(
  key: UsageKey,
  amount = 1
) {
  noStore()

  const { orgId, org } = await requireOrg()
  const plan = org.plan

  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]
  if (!limits) {
    console.warn(`No limits defined for plan: ${plan}. Allowing action.`);
    return;
  }
  const limit = limits[key]

  if (limit === Infinity) return

  const ref = adminDb.collection('orgUsage').doc(orgId)
  const snap = await ref.get()

  const now = new Date()
  const periodEnd = org.currentPeriodEnd?.toDate()

  if (!periodEnd || periodEnd < now) {
    redirect('/billing')
  }

  if (!snap.exists || snap.data()?.periodEnd?.toDate() < now) {
    await ref.set({
      periodStart: now,
      periodEnd,
      usage: {
        apiCalls: 0,
        aiTokens: 0,
        exports: 0,
      },
    })
  }

  const used = snap.data()?.usage?.[key] ?? 0

  if (used + amount > limit) {
    redirect('/billing?limit_reached=1')
  }

  await ref.update({
    [`usage.${key}`]: adminDb.FieldValue.increment(amount),
  })
}
