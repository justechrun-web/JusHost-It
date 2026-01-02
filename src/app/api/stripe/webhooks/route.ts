'use server';

import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {headers} from 'next/headers';
import {initializeApp, getApps, cert} from 'firebase-admin/app';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const db = getFirestore();

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({error: err.message}, {status: 400});
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      // This is the source of truth for a successful subscription creation.
      const {uid, plan} = session.metadata || {};

      if (!uid || !plan) {
        console.error('Webhook Error: Missing metadata for uid or plan in checkout session.');
        return NextResponse.json({error: 'Missing user ID or plan in session metadata'}, {status: 400});
      }
      
      const subscriptionId = session.subscription;
      const stripeCustomerId = session.customer;

      try {
        const userRef = db.doc(`users/${uid}`);
        const billingRef = db.doc(`users/${uid}/billingSubscriptions/${uid}`);

        await db.runTransaction(async (transaction) => {
            transaction.update(userRef, {
                subscriptionStatus: 'active',
                plan: plan,
                stripeCustomerId: stripeCustomerId,
                updatedAt: FieldValue.serverTimestamp(),
            });

            // Create or update the billing subscription document
            transaction.set(billingRef, {
              plan: plan,
              status: 'active',
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: stripeCustomerId,
              // We'll get the next billing date from a separate webhook (`invoice.created` or `customer.subscription.updated`)
            }, { merge: true });
        });
        
        console.log(`Successfully activated plan '${plan}' for user ${uid}`);

      } catch (error) {
        console.error('Firestore update failed:', error);
        return NextResponse.json({error: 'Database update failed'}, {status: 500});
      }

      break;
    
    case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const usersQuery = db.collection('users').where('stripeCustomerId', '==', customerId).limit(1);
        const userSnapshot = await usersQuery.get();

        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await userDoc.ref.update({
                subscriptionStatus: 'canceled',
                plan: 'none',
                updatedAt: FieldValue.serverTimestamp(),
            });
            console.log(`Subscription canceled for user ${userDoc.id}`);
        }
        break;

    // Add other event types to handle here (e.g., invoice.payment_failed)
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({received: true});
}
