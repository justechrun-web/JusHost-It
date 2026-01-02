
'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });
    
    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } else if (setupIntent && setupIntent.status === 'succeeded') {
        toast({
            title: 'Payment Method Saved',
            description: 'Your payment method has been saved successfully.',
        });
        setMessage('Your payment method has been saved.');
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-6">
        <span id="button-text">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Payment Method'}
        </span>
      </Button>
      {message && <div id="payment-message" className="text-sm text-muted-foreground mt-4">{message}</div>}
    </form>
  );
}
