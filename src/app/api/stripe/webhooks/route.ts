'use server';

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

/**
 * This is the API route that Stripe will call to send webhook events.
 * It's crucial for keeping your application's state in sync with Stripe.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // This is the core logic of your webhook handler.
  // It updates the user's subscription status in your Firestore database
  // based on the events received from Stripe.
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;

      if (!userId) {
        console.error("Webhook Error: Missing userId in subscription metadata.", subscription.id);
        break;
      }
      
      const userSubscriptionRef = db.collection("users").doc(userId);

      try {
        await userSubscriptionRef.set({
          subscriptionStatus: subscription.status, // "trialing", "active", "canceled", "past_due"
          plan: subscription.items.data[0].price.id,
          currentPeriodEnd: subscription.current_period_end * 1000, // Convert to milliseconds
        }, { merge: true });

        console.log(`Updated subscription for user ${userId} to status: ${subscription.status}`);
      } catch (error) {
        console.error(`Firestore update failed for user ${userId}:`, error);
      }
      break;
    }
    
    // This event is sent when a checkout session is successfully completed.
    // It's a good place to initially set the subscription status.
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = subscription.metadata.userId;

        if (!userId) {
            console.error("Webhook Error: Missing userId in subscription metadata from checkout.session.completed.", session.id);
            break;
        }

        const userSubscriptionRef = db.collection("users").doc(userId);
        
        try {
            await userSubscriptionRef.set({
                stripeCustomerId: subscription.customer as string,
                subscriptionStatus: subscription.status,
                plan: subscription.items.data[0].price.id,
                currentPeriodEnd: subscription.current_period_end * 1000,
            }, { merge: true });

            console.log(`Initial subscription created for user ${userId}, status: ${subscription.status}`);
        } catch (error) {
            console.error(`Firestore initial setup failed for user ${userId}:`, error);
        }
      }
      break;
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
