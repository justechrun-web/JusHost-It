
'use server';

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth, db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    const userDoc = await db.collection("users").doc(userId).get();
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      // This can happen if a user signs up but never starts a checkout session
      // You can either create a customer here or direct them to pricing.
      return NextResponse.json({ error: "Stripe customer not found." }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error: any) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json({ error: "Failed to create billing portal session." }, { status: 500 });
  }
}
