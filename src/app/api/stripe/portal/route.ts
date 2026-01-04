import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const uid = headers().get('X-User-ID');
        if (!uid) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const userDoc = await adminDb.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return new NextResponse("User not found", { status: 404 });
        }
        
        const customerId = userDoc.data()?.stripeCustomerId;

        if (!customerId) {
            return new NextResponse("Stripe customer not found for user. Please subscribe to a plan first.", { status: 400 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Error creating billing portal session:", error);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
