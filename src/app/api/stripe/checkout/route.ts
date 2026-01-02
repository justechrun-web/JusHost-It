import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const uid = headers().get('X-User-ID');
    if (!uid) {
        return new NextResponse("Unauthorized: Missing user ID", { status: 401 });
    }
    
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const email = userDoc.data()?.email;
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!email) {
      // This should ideally not happen if user exists
      return new NextResponse("User email not found", { status: 404 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
        return new NextResponse("Price ID is required", { status: 400 });
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
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: { firebaseUID: uid },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
