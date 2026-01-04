
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PaymentForm } from '@/app/(main)/settings/payment-method/components/payment-form';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import React from 'react';
import { useUser } from '@/firebase';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function PaymentMethodPage() {
    const { user } = useUser();
    const [clientSecret, setClientSecret] = React.useState<string | null>(null);
    const [loadingSecret, setLoadingSecret] = React.useState(true);

    React.useEffect(() => {
        async function createSetupIntent() {
            if (!user) return;
            setLoadingSecret(true);
            try {
                const token = await user.getIdToken(true);
                const res = await fetch('/api/stripe/setup-intent', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to create setup intent');
                const data = await res.json();
                setClientSecret(data.client_secret);
            } catch (error) {
                console.error(error);
                // Handle error state in UI
            } finally {
                setLoadingSecret(false);
            }
        }
        createSetupIntent();
    }, [user]);

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
        {loadingSecret ? (
             <div className='flex justify-center items-center h-24'>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : clientSecret ? (
            <Elements options={{ clientSecret }} stripe={stripePromise}>
                <PaymentForm />
            </Elements>
        ) : (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Could not load the payment form. Please try again later.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
