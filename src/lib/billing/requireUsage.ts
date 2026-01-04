
import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import { requireUser } from '@/lib/auth/requireUser'
import { PLAN_LIMITS } from './limits'
import { redirect } from 'next/navigation'
import { noStore } from 'next/cache'

type UsageKey = 'apiCalls' | 'aiTokens' | 'exports'

export async function requireUsage(
  key: UsageKey,
  amount = 1
) {
  noStore()

  const { uid, user } = await requireUser()
  const plan = user.plan ?? 'free'

  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]
  const limit = limits[key]

  if (limit === Infinity) return

  const ref = adminDb.collection('usage').doc(uid)
  const snap = await ref.get()

  const now = new Date()
  const periodEnd = user.currentPeriodEnd?.toDate?.()

  if (!periodEnd || periodEnd < now) {
    redirect('/billing')
  }

  // Initialize or reset usage
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

  const currentUsage = snap.data()?.usage?.[key] ?? 0

  if (currentUsage + amount > limit) {
    redirect('/billing?limit_reached=1')
  }

  // Atomic increment
  await ref.update({
    [`usage.${key}`]: adminDb.FieldValue.increment(amount),
  })
}
