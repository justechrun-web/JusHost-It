import { NextRequest, NextResponse } from "next/server";
import { stripe } from '@/lib/stripe/server';
import { adminDb } from '@/lib/firebase/admin';
import { headers } from 'next/headers';

async function logAdminAction({ adminId, action, targetUserId, before, after }: { adminId: string, action: string, targetUserId: string, before: any, after: any }) {
  await adminDb.collection("auditLogs").add({
    adminId,
    action,
    targetId: targetUserId,
    before,
    after,
    timestamp: adminDb.FieldValue.serverTimestamp(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const adminId = headers().get('X-User-ID');
    const isAdmin = headers().get('X-User-Is-Admin') === 'true';

    if (!adminId || !isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const form = await req.formData()
    const uid = form.get("uid") as string
    const newPlan = form.get("plan") as string


    if (!uid || !newPlan || !adminId) {
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

    const priceId = process.env[`NEXT_PUBLIC_STRIPE_PRICE_${newPlan.toUpperCase()}`];
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
