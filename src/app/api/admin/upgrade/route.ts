import Stripe from "stripe"
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const uid = form.get("uid") as string
    const plan = form.get("plan") as string

    if (!uid || !plan) {
        return new NextResponse("Missing user ID or plan", { status: 400 });
    }

    const user = (await adminDb.doc(`users/${uid}`).get()).data()
    if (!user || !user.subscription?.id) {
        return new NextResponse("User or subscription not found", { status: 404 });
    }

    const priceId = process.env[`NEXT_PUBLIC_STRIPE_PRICE_${plan.toUpperCase()}`];
    if (!priceId) {
        return new NextResponse(`Price ID for plan '${plan}' not found in environment variables.`, { status: 500 });
    }

    const currentSubscription = await stripe.subscriptions.retrieve(user.subscription.id);
    
    await stripe.subscriptions.update(user.subscription.id, {
        items: [{
        id: currentSubscription.items.data[0].id,
        price: priceId,
        }],
        proration_behavior: "create_prorations",
    })

    await adminDb.doc(`users/${uid}`).update({ role: plan, 'subscription.plan': plan })
    
    // Redirect back to the admin billing page
    return NextResponse.redirect(new URL('/admin/billing', req.url), { status: 303 });

  } catch (error: any) {
    console.error("Admin upgrade error:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
