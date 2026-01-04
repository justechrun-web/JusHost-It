import "server-only";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";
import { buffer } from "node:stream/consumers";

export const runtime = 'nodejs';

const mapPriceIdToPlan = (priceId: string) => {
  const plans: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!]: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!]: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS!]: 'business',
  };
  return plans[priceId] || 'free';
};

export async function POST(req: Request) {
  const rawBody = await buffer(req.body!);
  const sig = headers().get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = adminDb;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const uid = session.metadata.firebaseUID;

        if (!uid) {
            console.error("Webhook Error: Missing firebaseUID in checkout session metadata.", session.id);
            return NextResponse.json({ error: "Missing user identifier in webhook metadata" }, { status: 400 });
        }

        await db.collection("users").doc(uid).set({
          stripeCustomerId: session.customer,
          plan: "starter", // Default to starter plan on initial checkout
          subscriptionStatus: "active", // Or 'trialing' if you use trials
          updatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as any;
        const customerId = sub.customer;
        
        const priceId = sub.items.data[0].price.id;
        const plan = mapPriceIdToPlan(priceId);

        const userQuery = await db.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
        if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            await userDoc.ref.update({
                subscriptionId: sub.id,
                subscriptionStatus: sub.status,
                plan: plan,
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
            });
        }
        break;
      }
       case "customer.subscription.deleted": {
          const sub = event.data.object as any;
          const customerId = sub.customer;
          const snap = await db
            .collection("users")
            .where("stripeCustomerId", "==", customerId)
            .limit(1)
            .get();

          if (!snap.empty) {
            const userDoc = snap.docs[0];
            await userDoc.ref.update({
              plan: "free",
              subscriptionStatus: "canceled",
            });
          }
          break;
        }
    }
  } catch (error) {
      console.error(`Webhook handler for ${event.type} failed:`, error);
      return new NextResponse("Webhook handler failed. See logs.", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
