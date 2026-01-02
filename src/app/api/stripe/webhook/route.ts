
'use server';

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

const auth = getAuth();
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
    if (event.type === 'checkout.session.completed') {
        const checkoutSession = session as Stripe.Checkout.Session;
        const uid = checkoutSession.metadata?.firebaseUID;

        if (!uid) {
            console.error("Webhook Error: Missing firebaseUID in checkout session metadata.", checkoutSession.id);
            return NextResponse.json({ received: true });
        }

        // Customer object is not expanded here, so we only get the ID.
        // We set the customer ID during checkout session creation now.
        const customerId = checkoutSession.customer as string;

        await db.collection("users").doc(uid).set({
            billing: {
                stripeCustomerId: customerId
            }
        }, { merge: true });
        console.log(`User ${uid} checkout session completed. Stripe Customer ID: ${customerId}`);


    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const sub = session as Stripe.Subscription;
        const uid = sub.metadata.firebaseUID;
        
        if (!uid) {
            console.error("Webhook Error: Missing firebaseUID in subscription metadata.", sub.id);
            return NextResponse.json({ received: true });
        }

        const priceId = sub.items.data[0]?.price.id;
        // For deleted events, price might not be relevant, but status is.
        const plan = priceId ? PLAN_BY_PRICE_ID[priceId] : null;

        const userUpdateData: any = {
            billing: {
              status: sub.status,
              subscriptionId: sub.id,
              stripeCustomerId: sub.customer as string,
            },
        };
        
        if (plan) {
            userUpdateData.role = plan;
            userUpdateData.billing.plan = plan;
        }

        if (sub.status === 'active' || sub.status === 'trialing') {
            userUpdateData.billing.currentPeriodEnd = new Date(sub.current_period_end * 1000);
        } else {
            // For canceled, past_due, etc., we can clear the role or set to a base level
             userUpdateData.role = 'free'; // or whatever your base role is
        }
        
        await db.collection("users").doc(uid).set(userUpdateData, { merge: true });
        console.log(`Updated subscription for user ${uid}. Status: ${sub.status}, Plan: ${plan || 'N/A'}`);
    } else if (event.type === 'invoice.payment_failed') {
        const invoice = session as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userQuery = await db.collection('users').where('billing.stripeCustomerId', '==', customerId).limit(1).get();

        if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            await userDoc.ref.set({
                billing: { status: 'past_due' }
            }, { merge: true });
            console.log(`User ${userDoc.id} has a failed payment. Set status to past_due.`);
        }
    }

  } catch (error) {
     console.error(`Firestore update failed for event ${event.type}:`, error);
     return new NextResponse("Webhook handler failed. See logs.", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
