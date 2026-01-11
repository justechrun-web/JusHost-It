import { redirect } from 'next/navigation'
import { requireUser } from './requireUser'

const PLAN_ORDER = ['free', 'starter', 'pro', 'business']

export async function requirePlan(minPlan: 'starter' | 'pro' | 'business') {
  const { user } = await requireUser()

  const userPlan = user.plan ?? 'free'

  if (
    PLAN_ORDER.indexOf(userPlan) <
    PLAN_ORDER.indexOf(minPlan)
  ) {
    redirect('/billing')
  }

  return user
}
