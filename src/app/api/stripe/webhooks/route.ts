
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

  const session = event.data.object as any;
  const userId = session.metadata?.userId;

  if (!userId && event.type !== 'checkout.session.completed') {
    console.error("Webhook Error: Missing userId in metadata for non-checkout event.", session.id);
    return NextResponse.json({ received: true }); // Acknowledge event but do nothing
  }


  try {
    switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
            const userSubscriptionRef = db.collection("users").doc(userId);
            await userSubscriptionRef.set({
                subscriptionStatus: session.status, // "trialing", "active", "past_due"
                plan: session.items.data[0].price.id,
                currentPeriodEnd: session.current_period_end, // Store as Unix timestamp
            }, { merge: true });
            console.log(`Updated subscription for user ${userId} to status: ${session.status}`);
            break;
        }

        case "customer.subscription.deleted": {
            const userSubscriptionRef = db.collection("users").doc(userId);
            await userSubscriptionRef.set({
                subscriptionStatus: "canceled",
            }, { merge: true });
            console.log(`Canceled subscription for user ${userId}.`);
            break;
        }

        case 'checkout.session.completed': {
            const checkoutUserId = session.metadata?.userId || (session.customer_details?.email ? (await db.collection('users').where('email', '==', session.customer_details.email).get()).docs[0]?.id : null);
             if (!checkoutUserId) {
                console.error("Webhook Error: Could not determine user ID from checkout session.", session.id);
                break;
            }
            const userSubscriptionRef = db.collection("users").doc(checkoutUserId);

            await userSubscriptionRef.set({
                stripeCustomerId: session.customer as string,
                // The subscription is created in the 'trialing' state, this will be updated
                // by the 'customer.subscription.created' event which fires almost immediately after.
            }, { merge: true });
            console.log(`User ${checkoutUserId} completed checkout. Customer ID: ${session.customer}`);
            break;
        }

        default:
            console.log(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
     console.error(`Firestore update failed for event ${event.type}:`, error);
     return NextResponse.json({ error: "Firestore update failed." }, { status: 500 });
  }


  return NextResponse.json({ received: true });
}
