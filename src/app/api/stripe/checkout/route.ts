import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";
import { PLAN_BY_PRICE_ID } from "@/lib/stripePlans";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const uid = headers().get('X-User-ID');
    if (!uid) {
        return new NextResponse("Unauthorized: Missing user ID", { status: 401 });
    }
    
    const { plan } = await req.json();

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_PRO
        : plan === "business"
        ? process.env.STRIPE_PRICE_BUSINESS
        : process.env.STRIPE_PRICE_STARTER;


    if (!priceId) {
        return new NextResponse("Invalid plan", { status: 400 });
    }

    if (!Object.values(PLAN_BY_PRICE_ID).includes(plan)) {
        return new NextResponse("Invalid plan ID", { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const email = userDoc.data()?.email;
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!email) {
      return new NextResponse("User email not found", { status: 404 });
    }

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email,
            metadata: { firebaseUID: uid },
        });
        stripeCustomerId = customer.id;
        await userDocRef.set({ 
            stripeCustomerId
        }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: uid, 
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        metadata: { firebaseUID: uid },
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
