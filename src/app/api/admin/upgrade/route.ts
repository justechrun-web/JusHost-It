
import { NextRequest, NextResponse } from "next/server";
import { stripe } from '@/lib/stripe/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { verifySessionCookie } from "@/lib/auth/verify-session";

export const runtime = 'nodejs';

async function logAdminAction({ adminId, action, targetUserId, before, after }: { adminId: string, action: string, targetUserId: string, before: any, after: any }) {
  await adminDb.collection("auditLogs").add({
    actorUid: adminId,
    actorRole: 'admin',
    type: 'admin_plan_change',
    orgId: targetUserId, // In this context, the target user's ID is used as the org identifier for the log
    metadata: {
        targetUserId,
        action,
        before,
        after,
    },
    createdAt: adminDb.FieldValue.serverTimestamp(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = cookies().get('__session')?.value;
    if (!session) {
      return new NextResponse("Unauthorized: No session", { status: 401 });
    }

    const decodedToken = await verifySessionCookie(session);

    if (!decodedToken || !decodedToken.admin) {
        return new NextResponse("Unauthorized: Not an admin", { status: 403 });
    }
    const adminId = decodedToken.uid;

    const form = await req.formData()
    const uid = form.get("uid") as string
    const newPlan = form.get("plan") as string


    if (!uid || !newPlan) {
        return new NextResponse("Missing user ID or plan", { status: 400 });
    }

    const userRef = adminDb.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        return new NextResponse("User not found", { status: 404 });
    }
    const user = userDoc.data()!;
    const subscriptionId = user.subscriptionId;

    if (!subscriptionId) {
        return new NextResponse("User does not have a subscription to update.", { status: 400 });
    }

    const priceId = process.env[`STRIPE_PRICE_${newPlan.toUpperCase()}`];
    if (!priceId) {
        return new NextResponse(`Price ID for plan '${newPlan}' not found in environment variables.`, { status: 500 });
    }

    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const oldPlan = user.plan;
    
    await stripe.subscriptions.update(subscriptionId, {
        items: [{
        id: currentSubscription.items.data[0].id,
        price: priceId,
        }],
        proration_behavior: "create_prorations",
    });

    await userRef.update({ plan: newPlan });

    await logAdminAction({
        adminId: adminId,
        action: 'ADMIN_PLAN_CHANGE',
        targetUserId: uid,
        before: { plan: oldPlan },
        after: { plan: newPlan }
    });
    
    const referer = req.headers.get('referer');
    const redirectUrl = referer || new URL('/admin/billing', req.url);

    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });


  } catch (error: any) {
    console.error("Admin upgrade error:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
