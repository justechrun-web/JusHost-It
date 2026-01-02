
'use server';

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

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
  
  // Use metadata from subscription for ongoing events, or from checkout session for initial setup.
  const userId = session.metadata?.userId || (event.type === 'checkout.session.completed' ? session.metadata?.uid : null);
  
  if (!userId) {
    console.error("Webhook Error: Missing userId in metadata.", session.id);
    return NextResponse.json({ received: true }); // Acknowledge event but do nothing
  }


  try {
    switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
            const userRef = db.collection("users").doc(userId);
            const subscriptionData = {
                subscriptionStatus: session.status, // e.g., "trialing", "active", "past_due"
                plan: session.items.data[0].price.id,
                currentPeriodEnd: session.current_period_end, // Store as Unix timestamp
            };
            await userRef.set(subscriptionData, { merge: true });
            
            // Set a secure cookie with the subscription status
            cookies().set('auth-status', session.status, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });

            console.log(`Updated subscription for user ${userId} to status: ${session.status}`);
            break;
        }

        case "customer.subscription.deleted": {
            const userRef = db.collection("users").doc(userId);
            await userRef.set({
                subscriptionStatus: "canceled",
            }, { merge: true });

            // Clear the cookie on cancellation
            cookies().delete('auth-status');
            
            console.log(`Canceled subscription for user ${userId}.`);
            break;
        }

        case 'checkout.session.completed': {
            const checkoutUserId = session.metadata?.uid;
            if (!checkoutUserId) {
                console.error("Webhook Error: Could not determine user ID from checkout session.", session.id);
                break;
            }
            const userRef = db.collection("users").doc(checkoutUserId);

            // This creates the customer in Firestore if they don't exist yet,
            // which can happen with email-based sign-ins.
            await userRef.set({
                stripeCustomerId: session.customer as string,
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

