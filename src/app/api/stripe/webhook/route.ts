import "server-only";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { Stripe } from "stripe";
import { PLAN_BY_PRICE_ID } from "@/lib/stripePlans";

export const runtime = 'nodejs';

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
    console.error("Webhook signature verification failed:", err);
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
        const orgId = session.metadata?.orgId;
        const creditAmount = Number(session.metadata?.creditAmount);

        if (!orgId) {
            console.error("Webhook Error: Missing orgId in checkout session metadata.", session.id);
            return NextResponse.json({ error: "Missing organization identifier in webhook metadata" }, { status: 400 });
        }

        // Handle one-time credit purchase
        if (creditAmount > 0 && session.payment_intent) {
            await adminDb.collection('orgCredits').add({
                orgId,
                amount: creditAmount,
                remaining: creditAmount,
                source: 'stripe',
                stripePaymentIntentId: session.payment_intent,
                expiresAt: null, // or set an expiration date
                createdAt: FieldValue.serverTimestamp(),
            });
        }
        // Handle subscription creation
        else if (session.subscription) {
            await adminDb.collection("orgs").doc(orgId).set({
              stripeCustomerId: session.customer,
            }, { merge: true });
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        
        const orgQuery = await adminDb.collection("orgs").where("stripeCustomerId", "==", customerId).limit(1).get();
        if (orgQuery.empty) break;
        
        const orgDoc = orgQuery.docs[0];
        const basePlanPriceId = sub.items.data.find(item => item.price.recurring)?.price.id;
        const plan = basePlanPriceId ? PLAN_BY_PRICE_ID[basePlanPriceId] : 'free';

        const subscriptionItemIds: { [key: string]: string } = {};
        sub.items.data.forEach(item => {
            if (item.price.id === process.env.STRIPE_PRICE_METERED_API) {
                subscriptionItemIds.apiCalls = item.id;
            }
            if (item.price.id === process.env.STRIPE_PRICE_METERED_AI) {
                subscriptionItemIds.aiTokens = item.id;
            }
             if (item.price.id === process.env.STRIPE_PRICE_METERED_EXPORTS) {
                subscriptionItemIds.exports = item.id;
            }
        });
        
        await orgDoc.ref.update({
            subscriptionId: sub.id,
            subscriptionStatus: sub.status,
            plan: plan,
            'seats.limit': sub.items.data.find(item => item.price.recurring)?.quantity || 1,
            currentPeriodEnd: FieldValue.serverTimestamp(),
            subscriptionItemIds: subscriptionItemIds
        });

        // Reset usage for new period
        await adminDb.collection('orgUsage').doc(orgDoc.id).set({
          periodStart: FieldValue.serverTimestamp(),
          periodEnd: FieldValue.serverTimestamp(),
          usage: { apiCalls: 0, aiTokens: 0, exports: 0 },
          overage: { apiCalls: 0, aiTokens: 0, exports: 0 },
        }, { merge: true });

        break;
      }
       case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;
          const snap = await adminDb
            .collection("orgs")
            .where("stripeCustomerId", "==", customerId)
            .limit(1)
            .get();

          if (!snap.empty) {
            const orgDoc = snap.docs[0];
            await orgDoc.ref.update({
              plan: "free",
              subscriptionStatus: "canceled",
              gracePeriodEndsAt: null,
            });
          }
          break;
        }
        case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;
            
            const orgQuery = await adminDb.collection("orgs").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!orgQuery.empty) {
                const orgDoc = orgQuery.docs[0];
                await orgDoc.ref.update({
                    subscriptionStatus: 'active',
                    gracePeriodEndsAt: null,
                    currentPeriodEnd: FieldValue.serverTimestamp(),
                    'autoTopUp.spentThisMonth': 0,
                    'autoTopUp.capPeriodStart': FieldValue.serverTimestamp(),
                });
            }
            break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;

            const orgQuery = await adminDb.collection("orgs").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!orgQuery.empty) {
                const orgDoc = orgQuery.docs[0];
                const graceDays = 7;
                const graceEnds = new Date(Date.now() + graceDays * 86400000);

                await orgDoc.ref.update({
                    subscriptionStatus: 'past_due',
                    gracePeriodEndsAt: graceEnds,
                });
            }
            break;
        }
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;
            
            const orgQuery = await adminDb.collection("orgs").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!orgQuery.empty) {
                const orgDoc = orgQuery.docs[0];
                await orgDoc.ref.update({
                    subscriptionStatus: 'active',
                    gracePeriodEndsAt: null,
                    currentPeriodEnd: FieldValue.serverTimestamp(),
                });
            }
            break;
        }
        case 'payment_intent.succeeded': {
            const pi = event.data.object as Stripe.PaymentIntent;

            // Only handle auto top-ups here. Manual purchases are handled by checkout.session.completed.
            if (pi.metadata?.type !== 'auto_top_up') break;

            const orgId = pi.metadata.orgId;
            const amount = pi.amount;

            if (orgId && amount) {
                await adminDb.collection('orgCredits').add({
                    orgId,
                    amount,
                    remaining: amount,
                    source: 'auto_top_up',
                    stripePaymentIntentId: pi.id,
                    expiresAt: null,
                    createdAt: FieldValue.serverTimestamp(),
                });
            }
            break;
        }
        case 'payment_intent.payment_failed': {
            const pi = event.data.object as Stripe.PaymentIntent;

            if (pi.metadata?.type !== 'auto_top_up') break;
            
            const orgId = pi.metadata.orgId;
            if (orgId) {
                 await adminDb.collection('orgs').doc(orgId).update({
                    'autoTopUp.enabled': false,
                    'autoTopUp.spentThisMonth': FieldValue.increment(-pi.amount),
                    'autoTopUp.spentToday': FieldValue.increment(-pi.amount),
                });
                // TODO: Notify user that auto top-up was disabled due to payment failure.
            }
            break;
        }
    }

    await eventRef.set({
      type: event.type,
      created: FieldValue.serverTimestamp(),
      status: 'processed'
    });

  } catch (error) {
      console.error(`Webhook handler for ${event.type} failed:`, error);
      // Still record the event to prevent retries, but mark it as failed.
      await eventRef.set({
        type: event.type,
        created: FieldValue.serverTimestamp(),
        status: 'failed',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        }
      });
      // We still return a 200 to Stripe to acknowledge receipt and stop retries.
      // The failure is logged on our end for manual investigation.
      return NextResponse.json({ received: true, error: "Webhook handler failed internally." });
  }

  return NextResponse.json({ received: true });
}
