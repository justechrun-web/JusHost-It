import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { uid } = await adminAuth.verifyIdToken(token);
        const userDoc = await adminDb.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return new NextResponse("User not found", { status: 404 });
        }
        
        const customerId = userDoc.data()?.stripeCustomerId;

        if (!customerId) {
            return new NextResponse("Stripe customer not found for user", { status: 404 });
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
