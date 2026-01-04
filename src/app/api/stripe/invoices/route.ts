
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";
import { requireOrg } from "@/lib/org/requireOrg";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    try {
        const { org } = await requireOrg();
        const customerId = org.stripeCustomerId;

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
        if (error.message.includes('No user found')) {
             return new NextResponse("Unauthorized", { status: 401 });
        }
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
