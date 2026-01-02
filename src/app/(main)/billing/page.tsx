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
import { Loader2, Cpu, MemoryStick, HardDrive } from "lucide-react";
import { reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { ResourceUsageChart } from "../components/resource-usage-chart";
import { useState } from "react";

type BillingSubscription = {
  id: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  nextBillingDate: { seconds: number };
  invoices: Array<{ date: string; amount: string; url: string }>;
};

// 5 minute timeout for re-authentication
const REAUTH_TIMEOUT = 5 * 60 * 1000;

export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const billingRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, `users/${user.uid}/billingSubscriptions`, user.uid);
  }, [db, user]);

  const { data: billingInfo, isLoading: isBillingLoading } = useDoc<BillingSubscription>(billingRef);

  const requiresStepUp = () => {
    if (!user?.metadata?.lastSignInTime) return true;
    const lastLogin = new Date(user.metadata.lastSignInTime).getTime();
    return (Date.now() - lastLogin) > REAUTH_TIMEOUT;
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setIsPortalLoading(true);

    const reauthenticate = async () => {
      toast({
        title: "Security Check Required",
        description: "For your security, please sign in again to manage your billing.",
      });
      try {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        toast({ title: "Re-authentication successful!", description: "You can now manage your billing." });
        return true;
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Re-authentication Failed',
          description: error.message || "Could not verify your identity.",
        });
        return false;
      }
    };

    if (requiresStepUp()) {
      const reauthSuccess = await reauthenticate();
      if (!reauthSuccess) {
        setIsPortalLoading(false);
        return;
      }
    }

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create billing portal session.');
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
        setIsPortalLoading(false);
    }
  };

  const isLoading = isUserLoading || isBillingLoading;
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view usage, and see payment history.
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
          <Button asChild className="mt-4">
            <Link href="/pricing">Choose a Plan</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active subscription details.</CardDescription>
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
                <Button onClick={handleManageBilling} className="w-full bg-primary text-primary-foreground" disabled={isPortalLoading}>
                    {isPortalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Manage in Stripe Portal
                </Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Usage</CardTitle>
                    <CardDescription>Your usage for the current billing period.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Cpu className="h-4 w-4" /><span>CPU</span></div>
                        <span className="font-mono text-sm">1,203 seconds</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><MemoryStick className="h-4 w-4" /><span>Memory</span></div>
                        <span className="font-mono text-sm">45.2 GB-hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><HardDrive className="h-4 w-4" /><span>Storage</span></div>
                        <span className="font-mono text-sm">2.1 GB</span>
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 grid gap-8">
             <Card>
              <CardHeader>
                <CardTitle>Resource Usage History</CardTitle>
                <CardDescription>Bandwidth and storage over the last 6 months.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceUsageChart />
              </CardContent>
            </Card>
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
