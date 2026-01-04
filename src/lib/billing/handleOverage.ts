
'use server';

import 'server-only';
import { adminDb, FieldValue } from '@/lib/firebase/admin';
import type { UsageKey } from './costs';

type HandleOverageParams = {
  org: any;
  departmentId?: string;
  feature: UsageKey;
  cost: number;
  uid: string;
};

export async function handleOverage({
  org,
  departmentId,
  feature,
  cost,
  uid,
}: HandleOverageParams): Promise<'allow' | 'pending'> {

  if (org.overagePolicy?.mode === 'auto' || !org.overagePolicy) {
    return 'allow';
  }

  // Check for an existing, recent, approved request for the same feature
  const approvals = await adminDb
    .collection('overageApprovals')
    .where('orgId', '==', org.id)
    .where('status', '==', 'approved')
    .where('feature', '==', feature)
    .limit(1)
    .get();

  if (!approvals.empty) {
    // Here you might add more complex logic, like checking if the approval is recent
    // or if the approved amount covers the current cost. For now, any approval allows.
    return 'allow';
  }

  // Create a new pending approval request
  await adminDb.collection('overageApprovals').add({
    orgId: org.id,
    departmentId,
    feature,
    requestedAmount: cost,
    status: 'pending',
    requestedByUid: uid,
    createdAt: FieldValue.serverTimestamp(),
    resolvedAt: null,
    approvedAmount: null,
    approvedByUid: null,
  });

  return 'pending';
}

    