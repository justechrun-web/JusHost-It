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
    const email = decoded.email!;
    const { priceId } = await req.json();

    if (!priceId) {
        return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email,
            name: decoded.name,
            metadata: { userId },
        });
        stripeCustomerId = customer.id;
        await userRef.set({ stripeCustomerId }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Important: trial_period_days is now preferred over subscription_data.trial_from_plan
      // when creating a checkout session directly with a price.
      // If your price object in Stripe has a trial period, you can omit this.
      // For clarity and control, we set it here.
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
