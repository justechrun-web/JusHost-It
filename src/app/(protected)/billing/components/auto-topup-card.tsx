
'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export type AutoTopUpCardProps = {
  orgId: string;
  autoTopUp?: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
  hasPaymentMethod: boolean;
};

export function AutoTopUpCard({
  orgId,
  autoTopUp,
  hasPaymentMethod,
}: AutoTopUpCardProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(autoTopUp?.enabled ?? false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!hasPaymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Payment Method Required',
        description: 'Please add a payment method to enable auto top-up.',
      });
      return;
    }

    setLoading(true);
    try {
      const orgRef = doc(db, 'orgs', orgId);
      await updateDoc(orgRef, {
        'autoTopUp.enabled': !enabled,
      });
      setEnabled(!enabled);
      toast({
        title: `Auto Top-Up ${!enabled ? 'Enabled' : 'Disabled'}`,
        description: `Your settings have been saved.`,
      });
    } catch (error: any) {
      console.error('Failed to toggle auto top-up:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your auto top-up settings.',
      });
    } finally {
      setLoading(false);
    }
  }

  const defaultThreshold = 2000;
  const defaultAmount = 10000;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto Top-Up</CardTitle>
        <CardDescription>
          Automatically buy credits when your balance is low.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="auto-topup-switch" className="flex flex-col space-y-1">
            <span>Enable Auto Top-Up</span>
            <span className="font-normal leading-snug text-muted-foreground">
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </Label>
          <Switch
            id="auto-topup-switch"
            checked={enabled}
            onCheckedChange={toggle}
            disabled={loading}
            aria-label="Toggle Auto Top-Up"
          />
        </div>
        {enabled && (
          <p className="text-sm text-muted-foreground">
            When credits fall below{' '}
            <strong>
              ${((autoTopUp?.threshold || defaultThreshold) / 100).toFixed(2)}
            </strong>
            , we will automatically purchase{' '}
            <strong>
              ${((autoTopUp?.amount || defaultAmount) / 100).toFixed(2)}
            </strong>{' '}
            of credits.
          </p>
        )}
      </CardContent>
      <CardFooter>
        {!hasPaymentMethod && (
            <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Payment Method</AlertTitle>
                <AlertDescription>
                    You must have a saved payment method to enable auto top-up.
                    <Button variant="link" asChild className="p-0 h-auto ml-1">
                        <Link href="/settings/payment-method">Add one now</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
