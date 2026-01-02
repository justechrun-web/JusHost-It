import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
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
            return NextResponse.json({ invoices: [] });
        }

        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: 20,
        });

        return NextResponse.json({ invoices: invoices.data });

    } catch (error: any) {
        console.error("Error fetching invoices:", error);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
