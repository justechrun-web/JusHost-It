
import "server-only";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb, adminAuth, FieldValue } from "@/lib/firebase/admin";
import type { Stripe } from "stripe";
import { PLAN_BY_PRICE_ID } from "@/lib/stripePlans";

export const runtime = 'nodejs';

async function setPlanClaim(uid: string, plan: string) {
    const user = await adminAuth.getUser(uid);
    const currentClaims = user.customClaims || {};
    // Preserve existing claims, like admin status
    await adminAuth.setCustomUserClaims(uid, { ...currentClaims, plan });
}

export async function POST(req: Request) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const eventRef = adminDb.collection('stripe_events').doc(event.id);
  const doc = await eventRef.get();
  if (doc.exists) {
    return NextResponse.json({ received: true, message: 'Event already handled.' });
  }
  
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;

        if (!uid) {
             console.error("Webhook Error: Missing client_reference_id (uid) in checkout session.", session.id);
             return NextResponse.json({ error: "Missing user identifier in webhook metadata" }, { status: 400 });
        }

        if (session.subscription) {
            // Subscription created via checkout
            await adminDb.collection("users").doc(uid).set({
              stripeCustomerId: session.customer,
            }, { merge: true });
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata.firebaseUID;
        
        if (!uid) break;

        const userRef = adminDb.collection('users').doc(uid);
        const basePlanPriceId = sub.items.data.find(item => item.price.recurring)?.price.id;
        const plan = basePlanPriceId ? PLAN_BY_PRICE_ID[basePlanPriceId] : 'free';

        await userRef.update({
            subscriptionId: sub.id,
            subscriptionStatus: sub.status,
            plan: plan,
            currentPeriodEnd: FieldValue.fromMillis(sub.current_period_end * 1000),
        });

        await setPlanClaim(uid, plan);

        break;
      }
       case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const uid = sub.metadata.firebaseUID;
          if (!uid) break;

          const userRef = adminDb.collection('users').doc(uid);
          await userRef.update({
            plan: "free",
            subscriptionStatus: "canceled",
          });
          await setPlanClaim(uid, "free");
          break;
        }
        case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const uid = sub.metadata.firebaseUID;

            if (!uid) break;
            
            const userRef = adminDb.collection('users').doc(uid);
            await userRef.update({
                subscriptionStatus: 'active',
                currentPeriodEnd: FieldValue.fromMillis(invoice.period_end * 1000),
            });
            break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const uid = sub.metadata.firebaseUID;

            if (!uid) break;

            const userRef = adminDb.collection('users').doc(uid);
            await userRef.update({
                subscriptionStatus: 'past_due',
            });
            break;
        }
    }

    await eventRef.set({
      type: event.type,
      created: FieldValue.serverTimestamp(),
      status: 'processed'
    });

  } catch (error) {
      console.error("Webhook handler for event type '%s' failed:", event.type, error);
      await eventRef.set({
        type: event.type,
        created: FieldValue.serverTimestamp(),
        status: 'failed',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        }
      });
      return NextResponse.json({ received: true, error: "Webhook handler failed internally." });
  }

  return NextResponse.json({ received: true });
}
