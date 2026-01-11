import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/auth/requireUser";
import { PLAN_BY_PRICE_ID } from "@/lib/stripePlans";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();
    const { plan } = await req.json();

    const priceId =
      plan === "pro"
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
        : plan === "business"
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER;

    if (!priceId || !Object.values(PLAN_BY_PRICE_ID).includes(plan)) {
        return new NextResponse("Invalid plan specified", { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(user.id);
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.displayName,
            metadata: { firebaseUID: user.id },
        });
        stripeCustomerId = customer.id;
        await userDocRef.update({ stripeCustomerId });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: user.id, 
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        metadata: { firebaseUID: user.id },
        trial_period_days: 7,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    if (error.message.includes('No user found')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
