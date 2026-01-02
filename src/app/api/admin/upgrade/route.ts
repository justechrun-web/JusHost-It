
import Stripe from "stripe"
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from "next/server";

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const adminDb = getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function logAdminAction({ adminId, action, targetUserId, before, after }: { adminId: string, action: string, targetUserId: string, before: any, after: any }) {
  await adminDb.collection("auditLogs").add({
    adminId,
    action,
    targetUserId,
    before,
    after,
    timestamp: FieldValue.serverTimestamp(),
  });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const uid = form.get("uid") as string
    const newPlan = form.get("plan") as string
    const adminId = form.get("adminId") as string;


    if (!uid || !newPlan || !adminId) {
        return new NextResponse("Missing user ID, plan, or admin ID", { status: 400 });
    }

    const userRef = adminDb.doc(`users/${uid}`);
    const user = (await userRef.get()).data()
    if (!user || !user.subscription?.id) {
        return new NextResponse("User or subscription not found", { status: 404 });
    }

    const priceId = process.env[`NEXT_PUBLIC_STRIPE_PRICE_${newPlan.toUpperCase()}`];
    if (!priceId) {
        return new NextResponse(`Price ID for plan '${newPlan}' not found in environment variables.`, { status: 500 });
    }

    const currentSubscription = await stripe.subscriptions.retrieve(user.subscription.id);
    const oldPlan = user.role;
    
    await stripe.subscriptions.update(user.subscription.id, {
        items: [{
        id: currentSubscription.items.data[0].id,
        price: priceId,
        }],
        proration_behavior: "create_prorations",
    })

    await userRef.update({ 
        role: newPlan, 
        'subscription.plan': newPlan 
    });

    await logAdminAction({
        adminId: adminId,
        action: 'ADMIN_PLAN_CHANGE',
        targetUserId: uid,
        before: { plan: oldPlan },
        after: { plan: newPlan }
    });
    
    return NextResponse.redirect(new URL('/admin/billing', req.url), { status: 303 });

  } catch (error: any) {
    console.error("Admin upgrade error:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
