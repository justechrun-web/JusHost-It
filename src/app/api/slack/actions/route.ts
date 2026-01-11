
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import * as crypto from 'crypto';
import { logAdminAction } from '@/lib/audit/logAdminAction';

// This function is crucial for verifying that the request is coming from Slack.
async function verifySlackRequest(req: NextRequest) {
  const signature = req.headers.get('x-slack-signature');
  const timestamp = req.headers.get('x-slack-request-timestamp');
  const body = await req.text(); // Read the raw body text

  if (!signature || !timestamp || !process.env.SLACK_SIGNING_SECRET) {
    return { isValid: false, body };
  }

  const baseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
  const computedSignature = `v0=${hmac.update(baseString).digest('hex')}`;

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
  
  return { isValid, body };
}


export async function POST(req: NextRequest) {
  try {
    const { isValid, body } = await verifySlackRequest(req);
    if (!isValid) {
      return new NextResponse('Invalid Slack signature', { status: 401 });
    }

    const payload = new URLSearchParams(body);
    const actionPayload = JSON.parse(payload.get('payload') || '{}');

    if (actionPayload.type !== 'block_actions') {
      return new NextResponse(null, { status: 200 });
    }

    const approvalId = actionPayload.actions[0].value;
    const action = actionPayload.actions[0].action_id;
    const slackUser = actionPayload.user;

    const approvalRef = adminDb.collection('overageApprovals').doc(approvalId);
    const approvalDoc = await approvalRef.get();
    
    if (!approvalDoc.exists) {
        throw new Error(`Approval document ${approvalId} not found.`);
    }

    const approval = approvalDoc.data()!;
    const status = action === 'approve_overage' ? 'approved' : 'rejected';

    await approvalRef.update({
      status,
      approvedBySlackUser: { id: slackUser.id, name: slackUser.name },
      resolvedAt: adminDb.FieldValue.serverTimestamp(),
    });
    
    // In a real app, you'd find the user record associated with the Slack user
    // to get their UID for the audit log. For now, we'll use a placeholder.
    await logAdminAction({
        type: action === 'approve_overage' ? 'overage_approved' : 'overage_rejected',
        actorUid: 'slack_system', // Placeholder
        actorRole: 'admin', // Assumed role
        orgId: approval.orgId,
        metadata: {
            approvalId: approvalId,
            feature: approval.feature,
            amount: approval.requestedAmount,
            slackUser: slackUser.name,
        }
    });

    // You can also update the original Slack message to show it was handled
    // using actionPayload.response_url

    return new NextResponse(null, { status: 200 });

  } catch (error: any) {
    console.error('Slack action handler failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

    