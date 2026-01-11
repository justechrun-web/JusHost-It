
import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { requireOrg } from "@/lib/org/requireOrg";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { org } = await requireOrg();
        const customerId = org.stripeCustomerId;

        if (!customerId) {
            return new NextResponse("Stripe customer not found for this organization.", { status: 400 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Error creating billing portal session:", error);
        if (error.message.includes('No user found')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
