
'use server';

import 'server-only';
import { adminDb, FieldValue } from '@/lib/firebase/admin';
import type { UsageKey } from './costs';
import { sendSlackAlert } from '../alerts/slack';

type HandleOverageParams = {
  org: any;
  departmentId?: string;
  feature: UsageKey;
  cost: number;
  uid: string;
  userEmail: string;
};

export async function handleOverage({
  org,
  departmentId,
  feature,
  cost,
  uid,
  userEmail,
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
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!approvals.empty) {
    // A simple check: if any recent approval exists, allow it.
    // A more complex system might check if the approved amount covers the cost.
    return 'allow';
  }

  // Create a new pending approval request
  const approvalRef = adminDb.collection('overageApprovals').doc();
  await approvalRef.set({
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

  const deptSnap = departmentId
    ? await adminDb.collection('departments').doc(departmentId).get()
    : null;
  const slackWebhookUrl = deptSnap?.data()?.alerts?.slackWebhookUrl;

  if (slackWebhookUrl) {
    const message = {
        text: `Overage approval required for ${deptSnap?.data()?.name}`,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `🚨 *Overage Approval Required*\n*Dept:* ${deptSnap?.data()?.name || 'N/A'}\n*Feature:* ${feature}\n*Amount:* $${(cost / 100).toFixed(2)}\n*Requested by:* ${userEmail}`
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: { type: "plain_text", text: "Approve" },
                        style: "primary",
                        value: approvalRef.id,
                        action_id: "approve_overage"
                    },
                    {
                        type: "button",
                        text: { type: "plain_text", text: "Reject" },
                        style: "danger",
                        value: approvalRef.id,
                        action_id: "reject_overage"
                    }
                ]
            }
        ]
    };
    await sendSlackAlert(slackWebhookUrl, message);
  }

  return 'pending';
}

    