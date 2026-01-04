'use server'

import { requireOrg } from './requireOrg'
import { PLAN_LIMITS } from '@/lib/billing/limits'
import { adminDb } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'

interface InviteUserInput {
    email: string;
    role: 'admin' | 'member' | 'viewer';
}

export async function inviteUser({ email, role }: InviteUserInput) {
  const { org, orgId, role: inviterRole } = await requireOrg();

  if (inviterRole !== 'owner' && inviterRole !== 'admin') {
      throw new Error('Only owners or admins can invite new members.');
  }

  const seatLimit = PLAN_LIMITS[org.plan as keyof typeof PLAN_LIMITS]?.seats ?? 0;
  if (org.seats.used >= seatLimit) {
    throw new Error('Seat limit reached. Please upgrade your plan to invite more members.');
  }

  // Logic to create an invitation document in Firestore
  const invitationRef = adminDb.collection('orgInvitations').doc();
  await invitationRef.set({
      orgId,
      email,
      role,
      status: 'pending',
      createdAt: adminDb.FieldValue.serverTimestamp(),
      expiresAt: adminDb.Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // In a real app, you would also send an email with a unique invitation link
  // that includes the invitation ID.
  console.log(`Invitation created for ${email} with ID ${invitationRef.id}`);

  // This would typically not redirect, but for demonstration we can.
  // The client-side form would handle the UI update.
}
