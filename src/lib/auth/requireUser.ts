
import 'server-only'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'
import { noStore } from 'next/cache'

export async function requireUser() {
  noStore()

  const session = cookies().get('__session')?.value
  if (!session) redirect('/login')

  let decoded
  try {
    decoded = await adminAuth.verifySessionCookie(session, true)
  } catch {
    redirect('/login')
  }

  const snap = await adminDb.collection('users').doc(decoded.uid).get()
  if (!snap.exists) {
      // In a real app, you might redirect to an onboarding flow
      // if the user is authenticated but has no user profile document.
      redirect('/login')
  }

  const user = snap.data()!;
  
  const status = user.subscriptionStatus;
  const graceEnds = user.gracePeriodEndsAt?.toDate?.();
  const now = new Date();

  const isGraceValid = status === 'past_due' && graceEnds && graceEnds > now;
  const hasAccess = status === 'active' || status === 'trialing' || isGraceValid;

  // Redirect if billing status is not valid
  if (!hasAccess) {
    redirect('/billing-required');
  }

  return {
    uid: decoded.uid,
    user: user,
  }
}
