
import "server-only";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";
import { buffer } from "node:stream/consumers";
import type { Stripe } from "stripe";
import { noStore } from "next/cache";

export const runtime = 'nodejs';

const mapPriceIdToPlan = (priceId: string) => {
  const plans: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER!]: 'starter',
    [process.env.STRIPE_PRICE_PRO!]: 'pro',
    [process.env.STRIPE_PRICE_BUSINESS!]: 'business',
  };
  return plans[priceId] || 'free';
};

export async function POST(req: Request) {
  noStore();
  const rawBody = await buffer(req.body!);
  const sig = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // Idempotency check: Ensure we haven't processed this event before.
  const eventRef = adminDb.collection('stripe_events').doc(event.id);
  const doc = await eventRef.get();
  if (doc.exists) {
    return NextResponse.json({ received: true, message: 'Event already handled.' });
  }
  
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUID;

        if (!uid) {
            console.error("Webhook Error: Missing firebaseUID in checkout session metadata.", session.id);
            return NextResponse.json({ error: "Missing user identifier in webhook metadata" }, { status: 400 });
        }
        
        await adminDb.collection("users").doc(uid).set({
          stripeCustomerId: session.customer,
        }, { merge: true });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        
        const priceId = sub.items.data[0].price.id;
        const plan = mapPriceIdToPlan(priceId);

        const userQuery = await adminDb.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
        if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            await userDoc.ref.update({
                subscriptionId: sub.id,
                subscriptionStatus: sub.status,
                plan: plan,
                currentPeriodEnd: adminDb.Timestamp.fromMillis(sub.current_period_end * 1000),
            });
        }
        break;
      }
       case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;
          const snap = await adminDb
            .collection("users")
            .where("stripeCustomerId", "==", customerId)
            .limit(1)
            .get();

          if (!snap.empty) {
            const userDoc = snap.docs[0];
            await userDoc.ref.update({
              plan: "free",
              subscriptionStatus: "canceled",
              gracePeriodEndsAt: null,
            });
          }
          break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;

            const userQuery = await adminDb.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!userQuery.empty) {
                const userDoc = userQuery.docs[0];
                const graceDays = 7;
                const graceEnds = new Date(Date.now() + graceDays * 86400000);

                await userDoc.ref.update({
                    subscriptionStatus: 'past_due',
                    gracePeriodEndsAt: graceEnds,
                });
            }
            break;
        }
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;

            const userQuery = await adminDb.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!userQuery.empty) {
                const userDoc = userQuery.docs[0];
                await userDoc.ref.update({
                    subscriptionStatus: 'active',
                    gracePeriodEndsAt: null,
                });
            }
            break;
        }
    }

    // Record that we've handled the event to prevent replay attacks.
    await eventRef.set({
      type: event.type,
      created: adminDb.Timestamp.fromMillis(event.created * 1000),
    });

  } catch (error) {
      console.error(`Webhook handler for ${event.type} failed:`, error);
      return new NextResponse("Webhook handler failed. See logs.", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
