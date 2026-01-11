
'use server'
import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import { requireUser } from '@/lib/auth/requireUser'
import { redirect } from 'next/navigation'

export async function requireOrg() {
  const { uid, user } = await requireUser()

  if (!user.orgId) {
    // This case should be rare if user creation flow is solid,
    // but it's a good safeguard.
    redirect('/onboarding/create-org')
  }

  const orgSnap = await adminDb
    .collection('orgs')
    .doc(user.orgId)
    .get()

  if (!orgSnap.exists) {
    console.error(`Inconsistent state: User ${uid} has orgId ${user.orgId} but org does not exist.`);
    // Redirect to a safe place, maybe an error page or onboarding
    redirect('/onboarding/create-org')
  }
  
  const org = orgSnap.data()!;

  // This is a simplified check. A real app might allow access to the billing page
  // itself while in read-only mode.
  if (org.readOnly?.enabled) {
      redirect(`/billing?reason=read_only`);
  }


  return {
    uid,
    user: { ...user, id: uid },
    role: user.role,
    orgId: user.orgId,
    org: { ...org, id: orgSnap.id },
  }
}

    