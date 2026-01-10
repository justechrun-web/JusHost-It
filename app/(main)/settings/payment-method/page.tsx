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
import { AlertCircle, Loader2 } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function PaymentMethodPage() {
    const [clientSecret, setClientSecret] = React.useState<string | null>(null);
    const [loadingSecret, setLoadingSecret] = React.useState(true);
    const { toast } = useToast();
    const { user } = useUser();

    React.useEffect(() => {
        async function createSetupIntent() {
            if (!user) return;
            setLoadingSecret(true);

            try {
                const token = await user.getIdToken();
                const response = await fetch('/api/stripe/setup-intent', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create payment setup.');
                }
                const data = await response.json();
                setClientSecret(data.client_secret);
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.message
                });
            } finally {
                setLoadingSecret(false);
            }
        }

        createSetupIntent();
    }, [user, toast]);

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
          Update your payment method. This will be used for all future invoices and charges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingSecret ? (
            <div className='flex items-center justify-center text-center text-muted-foreground p-8'>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span>Loading payment form...</span>
            </div>
        ) : clientSecret ? (
            <Elements options={{ clientSecret }} stripe={stripePromise}>
                <PaymentForm />
            </Elements>
        ) : (
            <div className='text-center text-muted-foreground p-8'>
                Could not load payment form. Please try again later.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
