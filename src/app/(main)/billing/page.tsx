
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

type BillingSubscription = {
  id: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  nextBillingDate: { seconds: number };
  invoices: Array<{ date: string; amount: string; url: string }>;
};

const requiresStepUp = (user: any) => {
  const lastLogin = user.metadata.lastSignInTime;
  // 5 minutes
  return Date.now() - new Date(lastLogin).getTime() > 5 * 60 * 1000;
};

export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Note: For simplicity, we assume one billing doc per user.
  // In a real app, you might have multiple or a different way to identify the active subscription.
  const billingRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    // This assumes the doc ID is the same as the user ID for simplicity.
    return doc(db, `users/${user.uid}/billingSubscriptions`, user.uid);
  }, [db, user]);

  const { data: billingInfo, isLoading: isBillingLoading } = useDoc<BillingSubscription>(billingRef);

  const handleManageBilling = async () => {
      if (!user) return;
      if (requiresStepUp(user)) {
          toast({
              title: "Security Check Required",
              description: "For your security, please sign in again to manage your billing.",
          });
          try {
              // This example uses Google. A real implementation would handle different providers.
              const provider = new GoogleAuthProvider(); 
              await reauthenticateWithPopup(user, provider);
              toast({ title: "Re-authentication successful!", description: "You can now manage your billing."});
              // In a real app, you would now proceed to the Stripe portal.
              console.log("Proceeding to Stripe portal...");
          } catch(error: any) {
               toast({
                variant: 'destructive',
                title: 'Re-authentication Failed',
                description: error.message || "Could not verify your identity.",
              });
          }
      } else {
         // In a real app, you would redirect to the Stripe customer portal here.
         console.log("Proceeding to Stripe portal...");
          toast({
            title: "Redirecting to Stripe...",
            description: "Opening your secure billing portal.",
          });
      }
  }

  const isLoading = isUserLoading || isBillingLoading;
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view your payment history.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-16">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : !billingInfo ? (
         <Card className="text-center p-8">
          <CardTitle>No Subscription Found</CardTitle>
          <CardDescription className="mt-2">You do not have an active billing plan.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-2xl font-semibold capitalize">{billingInfo.plan} Plan</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={billingInfo.status === 'active' ? 'success' : 'destructive'} className="capitalize">
                      {billingInfo.status}
                    </Badge>
                    {billingInfo.nextBillingDate && (
                       <span className="text-sm text-muted-foreground">
                        Renews on {new Date(billingInfo.nextBillingDate.seconds * 1000).toLocaleDateString()}
                       </span>
                    )}
                  </div>
                </div>
                <Button onClick={handleManageBilling} className="w-full bg-primary text-primary-foreground">
                    Manage in Stripe Portal
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>A record of your past payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingInfo.invoices && billingInfo.invoices.length > 0 ? (
                      billingInfo.invoices.map((invoice, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{invoice.date}</TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <a href={invoice.url} target="_blank" rel="noopener noreferrer">View Invoice</a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No invoice history found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

    