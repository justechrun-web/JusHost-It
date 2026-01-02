
'use server';

import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import {initializeApp, getApps, cert} from 'firebase-admin/app';

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

export async function POST(req: Request) {
  const {plan, idToken} = await req.json();

  if (!plan || !idToken) {
    return NextResponse.json(
      {error: 'Missing plan or idToken'},
      {status: 400}
    );
  }

  // 🔐 Verify user identity with the Firebase ID token
  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return NextResponse.json({error: 'Invalid token'}, {status: 401});
  }
  const uid = decoded.uid;

  const priceMap: Record<string, string> = {
    starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!,
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
  };

  if (!priceMap[plan]) {
    return NextResponse.json({error: 'Invalid plan'}, {status: 400});
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: decoded.email,
      line_items: [{price: priceMap[plan], quantity: 1}],
      // The UID and plan are passed in metadata, which is secure.
      // The webhook will use this to provision the correct user's account.
      metadata: {uid, plan},
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
