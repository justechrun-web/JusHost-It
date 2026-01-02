'use server';

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, "\n"),
    }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const db = getFirestore();

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
        return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // 🔐 Verify identity
    const decoded = await getAuth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // 🔎 Lookup user billing record
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { stripeCustomerId } = userSnap.data()!;
    if (!stripeCustomerId) {
      return NextResponse.json({ error: "Stripe customer ID not found for this user." }, { status: 400 });
    }

    // 🔗 Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    const message = error.message || "Failed to create billing portal session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
