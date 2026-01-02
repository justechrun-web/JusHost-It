
'use server';

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";
import Stripe from "stripe";

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

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata.uid;
        if (!uid) {
            console.error("Webhook Error: Missing uid in subscription metadata.", sub.id);
            break;
        }

        await db.collection("users").doc(uid).set(
          {
            subscriptionStatus: sub.status,
            plan: sub.items.data[0].price.id,
            currentPeriodEnd: sub.current_period_end,
          },
          { merge: true }
        );
        console.log(`Updated subscription for user ${uid} to status: ${sub.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata.uid;
        if (!uid) {
            console.error("Webhook Error: Missing uid in subscription metadata.", sub.id);
            break;
        }
        
        await db.collection("users").doc(uid).set(
          {
            subscriptionStatus: "canceled",
          },
          { merge: true }
        );
        console.log(`Canceled subscription for user ${uid}.`);
        break;
      }

      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
            
            const uid = checkoutSession.metadata?.uid;
            if (!uid) {
                console.error("Webhook Error: Missing uid in checkout session metadata.", checkoutSession.id);
                break;
            }

            await db.collection("users").doc(uid).set(
              {
                stripeCustomerId: checkoutSession.customer as string,
                subscriptionStatus: subscription.status,
                plan: subscription.items.data[0].price.id,
                currentPeriodEnd: subscription.current_period_end,
              },
              { merge: true }
            );
             console.log(`User ${uid} completed checkout. Customer ID: ${checkoutSession.customer}`);
        }
        break;
      }
      
      default:
        // console.log(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
     console.error(`Firestore update failed for event ${event.type}:`, error);
     return new NextResponse("Webhook handler failed. See logs.", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
