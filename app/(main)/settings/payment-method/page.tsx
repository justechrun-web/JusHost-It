'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PaymentForm } from './components/payment-form';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import React from 'react';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function PaymentMethodPage() {
    const [clientSecret, setClientSecret] = React.useState<string | null>(null);

    React.useEffect(() => {
        // In a real app, you would fetch a SetupIntent client secret from your server
        // to securely initialize the Payment Element.
        // For this demo, we'll simulate it after a delay.
        const mockFetch = setTimeout(() => {
             // This is a mock secret. Replace with a real one from your backend.
            setClientSecret('seti_1PfY7kDEQaroqDjsB3zLp2fA_secret_QpLpQYvA5gX2h8z3s6g7h8k9l0m1n2o3');
        }, 1000);
        return () => clearTimeout(mockFetch);
    }, []);

    if (!stripePromise) {
        return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                    Stripe publishable key is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
                </AlertDescription>
            </Alert>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Update your payment method. This will be used for all future invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientSecret ? (
            <Elements options={{ clientSecret }} stripe={stripePromise}>
                <PaymentForm />
            </Elements>
        ) : (
            <div className='text-center text-muted-foreground'>
                Loading payment form...
            </div>
        )}
      </CardContent>
    </Card>
  );
}
