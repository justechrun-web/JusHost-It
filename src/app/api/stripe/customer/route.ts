
import 'server-only';
import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org/requireOrg';
import { stripe } from '@/lib/stripe/server';

export const runtime = 'nodejs';

/**
 * API route to fetch details about the organization's Stripe customer object.
 * This is used by the client to determine if a default payment method exists,
 * which is a prerequisite for enabling Auto Top-Up.
 */
export async function GET() {
  try {
    const { org } = await requireOrg();
    const customerId = org.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found for this organization.' },
        { status: 404 }
      );
    }

    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      return NextResponse.json(
        { error: 'Stripe customer has been deleted.' },
        { status: 410 }
      );
    }
    
    return NextResponse.json({
      hasDefaultPaymentMethod: !!customer.invoice_settings?.default_payment_method,
    });

  } catch (error: any) {
    console.error('API Error fetching Stripe customer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
