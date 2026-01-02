
'use server';

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { PLAN_BY_PRICE_ID } from "@/lib/stripePlans";

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

const auth = getAuth();
const db = getFirestore();

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  try {
    if (event.type.startsWith("customer.subscription")) {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata.uid;
        
        if (!uid) {
            console.error("Webhook Error: Missing uid in subscription metadata.", sub.id);
            return NextResponse.json({ received: true });
        }

        const priceId = sub.items.data[0].price.id;
        const plan = PLAN_BY_PRICE_ID[priceId];

        await db.collection("users").doc(uid).set(
          {
            role: plan, // Set top-level role
            billing: {
              status: sub.status,
              plan: plan, // "starter", "pro", etc.
              subscriptionId: sub.id,
              stripeCustomerId: sub.customer as string,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          },
          { merge: true }
        );
        console.log(`Updated subscription for user ${uid}. Status: ${sub.status}, Plan: ${plan}`);
    } else if (event.type === 'checkout.session.completed') {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === 'subscription') {
            const uid = checkoutSession.metadata?.uid;
            if (!uid) {
                console.error("Webhook Error: Missing uid in checkout session metadata.", checkoutSession.id);
                return NextResponse.json({ received: true });
            }

             await db.collection("users").doc(uid).set({
                billing: {
                    stripeCustomerId: checkoutSession.customer as string
                }
             }, { merge: true });
             console.log(`User ${uid} completed checkout. Customer ID: ${checkoutSession.customer}`);
        }
    }

  } catch (error) {
     console.error(`Firestore update failed for event ${event.type}:`, error);
     return new NextResponse("Webhook handler failed. See logs.", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
