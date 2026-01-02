import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(req: Request) {
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
