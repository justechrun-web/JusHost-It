'use server'
import 'server-only'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'
import { noStore } from 'next/cache'

export async function requireUser() {
  noStore()

  const session = cookies().get('__session')?.value
  if (!session) redirect('/login')

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(session, true)
  } catch (error) {
    console.error("Session verification failed:", error);
    redirect('/login')
  }

  const userSnap = await adminDb.collection('users').doc(decoded.uid).get()
  if (!userSnap.exists) {
      redirect('/login'); // Or to an onboarding flow
  }
  const user = userSnap.data()!;

  // If orgId is present, we need to check org status, not user status
  if (user.orgId) {
    const orgSnap = await adminDb.collection('orgs').doc(user.orgId).get();
    if (!orgSnap.exists) {
        // This case might indicate an inconsistent state, maybe redirect to a support page
        // or a page to re-create an org. For now, redirecting to billing seems safe.
        redirect('/billing-required'); 
    }

    const org = orgSnap.data()!;
    const status = org.subscriptionStatus;
    const graceEnds = org.gracePeriodEndsAt?.toDate?.();
    const now = new Date();
    
    const isGraceValid = status === 'past_due' && graceEnds && graceEnds > now;
    const hasAccess = status === 'active' || status === 'trialing' || isGraceValid;

    if (!hasAccess) {
      redirect('/billing-required');
    }
  }

  return {
    uid: decoded.uid,
    user: user,
  }
}
