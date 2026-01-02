
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

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { uid } = await auth.verifyIdToken(token);
        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return new NextResponse("User not found", { status: 404 });
        }
        
        const customerId = userDoc.data()?.stripeCustomerId;

        if (!customerId) {
            return NextResponse.json({ invoices: [] });
        }

        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: 20,
        });

        return NextResponse.json({ invoices: invoices.data });

    } catch (error: any) {
        console.error("Error fetching invoices:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

