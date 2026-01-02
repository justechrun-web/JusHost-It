'use server';

import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import {initializeApp, getApps, cert} from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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
  const { plan } = await req.json();
  const authHeader = req.headers.get('Authorization');

  if (!plan || !authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {error: 'Missing plan or authorization token'},
      {status: 400}
    );
  }
  
  const idToken = authHeader.split('Bearer ')[1];

  // 🔐 Verify user identity with the Firebase ID token
  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return NextResponse.json({error: 'Invalid token'}, {status: 401});
  }
  const uid = decoded.uid;
  const email = decoded.email;

  const priceMap: Record<string, string> = {
    starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!,
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
  };

  if (!priceMap[plan]) {
    return NextResponse.json({error: 'Invalid plan'}, {status: 400});
  }
  
  try {
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    let stripeCustomerId = userSnap.data()?.stripeCustomerId;

    // Create a Stripe customer if one doesn't exist.
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: decoded.name,
        metadata: { firebaseUID: uid },
      });
      stripeCustomerId = customer.id;
      // Use server timestamp and update the user document.
      await userRef.set({
        stripeCustomerId,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{price: priceMap[plan], quantity: 1}],
      // The UID and plan are passed in metadata for the webhook.
      metadata: { uid, plan },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({url: session.url});
  } catch (error) {
    console.error('Stripe Error:', error);
    return NextResponse.json(
      {error: 'Failed to create checkout session'},
      {status: 500}
    );
  }
}
