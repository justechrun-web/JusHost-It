
'use server';

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function mapPriceIdToPlan(priceId: string) {
  const plans = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!]: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!]: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS!]: 'business',
  };
  return plans[priceId as keyof typeof plans] || 'free';
}

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature")!;
  const body = await req.arrayBuffer();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = event.data.object;

  try {
    if (event.type === 'checkout.session.completed') {
      const checkoutSession = session as Stripe.Checkout.Session;
      const uid = checkoutSession.metadata?.firebaseUID;
      if (!uid) {
        console.error("Webhook Error: Missing firebaseUID in checkout session metadata.", checkoutSession.id);
        return NextResponse.json({ error: "Missing user identifier in webhook metadata" }, { status: 400 });
      }

      if (!checkoutSession.subscription) {
        console.error("Webhook Error: Checkout session did not create a subscription.", checkoutSession.id);
        return NextResponse.json({ error: "Subscription data missing in checkout session" }, { status: 400 });
      }
      
      const subscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string
      );
      
      const priceId = subscription.items.data[0].price.id;
      const plan = mapPriceIdToPlan(priceId);

      await db.doc(`users/${uid}`).set({
        stripeCustomerId: subscription.customer as string,
        role: 'paid',
        plan: plan,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      }, { merge: true });
      
      console.log(`User ${uid} subscribed to ${plan} plan.`);
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const priceId = sub.items.data[0].price.id;
      const plan = mapPriceIdToPlan(priceId);

      const snap = await db
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await userDoc.ref.update({
          plan,
          role: "paid",
          subscriptionStatus: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        });
        console.log(`Subscription for user ${userDoc.id} updated to ${plan}. Status: ${sub.status}`);
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const snap = await db
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await userDoc.ref.update({
          plan: "free",
          role: "free",
          subscriptionStatus: "canceled",
        });
        console.log(`Subscription for user ${userDoc.id} canceled. Role set to free.`);
      }
    }
  } catch (error) {
    console.error(`Webhook handler for ${event.type} failed:`, error);
    return new NextResponse("Webhook handler failed. See logs.", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
