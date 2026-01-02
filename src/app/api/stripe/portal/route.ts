
'use server';

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const auth = getAuth();
const db = getFirestore();

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { uid } = await auth.verifyIdToken(token);
        const user = await db.collection("users").doc(uid).get();
        const customerId = user.data()?.billing?.stripeCustomerId;

        if (!customerId) {
            return new NextResponse("Stripe customer not found", { status: 404 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Error creating billing portal session:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
