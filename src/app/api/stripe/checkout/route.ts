
'use server';

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth, db } from "@/lib/firebase-admin";


export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { uid, email } = await auth.verifyIdToken(token);
    const { priceId } = await req.json();

    if (!priceId) {
        return new NextResponse("Price ID is required", { status: 400 });
    }

    const userDoc = await db.collection('users').doc(uid).get();
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email,
            metadata: { firebaseUID: uid },
        });
        stripeCustomerId = customer.id;
        await db.collection('users').doc(uid).set({ 
            stripeCustomerId
        }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: { firebaseUID: uid }, // Pass UID here for webhook
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
