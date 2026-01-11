import 'server-only';
import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org/requireOrg';
import { stripe } from '@/lib/stripe/server';

export const runtime = 'nodejs';

/**
 * API route to create a Stripe SetupIntent.
 * This is used to securely collect payment method details from the client
 * without them ever touching our server.
 */
export async function POST() {
  try {
    const { org } = await requireOrg();
    const customerId = org.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found for this organization.' },
        { status: 404 }
      );
    }
    
    // Create a SetupIntent to collect card details
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session', // Indicate that this payment method may be used later
    });

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
    });

  } catch (error: any) {
    console.error('API Error creating SetupIntent:', error);
    if (error.message.includes('No user found')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
