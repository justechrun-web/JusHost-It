
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
  const authHeader = req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {error: 'Missing or invalid authorization token'},
      {status: 401}
    );
  }
  
  const idToken = authHeader.split('Bearer ')[1];

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return NextResponse.json({error: 'Invalid token'}, {status: 401});
  }
  
  const uid = decoded.uid;
  const email = decoded.email;

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
      await userRef.set({
        stripeCustomerId,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }

    const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        usage: 'on_session',
    });

    return NextResponse.json({ client_secret: setupIntent.client_secret });

  } catch (error) {
    console.error('Stripe Setup Intent Error:', error);
    return NextResponse.json(
      {error: 'Failed to create setup intent.'},
      {status: 500}
    );
  }
}
