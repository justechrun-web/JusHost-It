'use server';

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PLAN_BY_PRICE_ID } from "@/lib/stripePlans";

// Initialize Firebase Admin SDK if not already initialized
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

const db = getFirestore();

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  const session = event.data.object;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = session as Stripe.Checkout.Session;
        const uid = checkoutSession.metadata?.firebaseUID;
        if (!uid) {
            console.error("Webhook Error: Missing firebaseUID in checkout session metadata.", checkoutSession.id);
            break;
        }

        const subscription = await stripe.subscriptions.retrieve(
            checkoutSession.subscription as string
        );

        await db.doc(`users/${uid}`).set({
            stripeCustomerId: session.customer,
            role: PLAN_BY_PRICE_ID[subscription.items.data[0].price.id],
            subscription: {
                id: subscription.id,
                status: subscription.status,
                plan: PLAN_BY_PRICE_ID[subscription.items.data[0].price.id],
                priceId: subscription.items.data[0].price.id,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        }, { merge: true });

        console.log(`User ${uid} completed checkout. Role set to ${PLAN_BY_PRICE_ID[subscription.items.data[0].price.id]}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = session as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;
        const plan = PLAN_BY_PRICE_ID[priceId];
        const userSnap = await db.collection("users").where("stripeCustomerId", "==", sub.customer).limit(1).get();
        if (userSnap.empty) {
            console.error("Webhook Error: User with Stripe customer ID not found.", sub.customer);
            break;
        }
        const userDoc = userSnap.docs[0];
        await userDoc.ref.update({
            role: plan,
            'subscription.status': sub.status,
            'subscription.plan': plan,
            'subscription.priceId': priceId,
            'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
        });
        console.log(`Subscription updated for user ${userDoc.id}. New plan: ${plan}, Status: ${sub.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = session as Stripe.Subscription;
        const userSnap = await db.collection("users").where("subscription.id", "==", sub.id).limit(1).get();
        if(userSnap.empty) {
            console.error("Webhook Error: User with subscription ID not found.", sub.id);
            break;
        }

        userSnap.forEach(doc => {
            doc.ref.update({
                role: "free",
                subscription: null,
            });
        });
        console.log(`Subscription deleted for user ${userSnap.docs[0].id}. Role set to free.`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = session as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();

        if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            await userDoc.ref.update({ 'subscription.status': 'past_due' });
            console.log(`User ${userDoc.id} has a failed payment. Set status to past_due.`);
        }
        break;
      }
    }

  } catch (error) {
     console.error(`Firestore update failed for event ${event.type}:`, error);
     return new NextResponse("Webhook handler failed. See logs.", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
