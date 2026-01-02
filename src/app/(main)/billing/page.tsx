
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
import { useToast } from "@/hooks/use-toast";
import { ResourceUsageChart } from "../components/resource-usage-chart";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FEATURES } from "@/lib/features";

type UserData = {
  plan: 'starter' | 'pro' | 'business' | 'free';
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: { seconds: number };
  usage: {
    sites: number;
    bandwidthGb: number;
    storageGb: number;
  };
};

export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, `users/${user.uid}`);
  }, [db, user]);

  const { data: userData, isLoading: isBillingLoading } = useDoc<UserData>(userRef);
  const planFeatures = userData?.plan ? FEATURES[userData.plan as keyof typeof FEATURES] : null;


  useEffect(() => {
    async function fetchInvoices() {
        if (!user) return;
        setInvoicesLoading(true);
        try {
            const token = await user.getIdToken(true);
            const res = await fetch('/api/stripe/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch invoices');
            const data = await res.json();
            setInvoices(data.invoices);
        } catch (error) {
            console.error(error);
        } finally {
            setInvoicesLoading(false);
        }
    }
    if (user) {
        fetchInvoices();
    }
  }, [user]);


  const handleManageBilling = async () => {
    if (!user) return;
    setIsPortalLoading(true);

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
  
  const getStatusBadgeVariant = (status?: UserData['subscriptionStatus']) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'success';
      case 'past_due':
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const getPeriodEndDate = () => {
    if(!userData?.currentPeriodEnd) return '';
    const date = new Date(userData.currentPeriodEnd.seconds * 1000);
    return date.toLocaleDateString();
  }

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
      ) : !userData || !userData.subscriptionStatus ? (
         <Card className="text-center p-8">
          <CardTitle>No Subscription Found</CardTitle>
          <CardDescription className="mt-2">You do not have an active subscription plan.</CardDescription>
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
                  <p className="text-2xl font-semibold capitalize">{userData.plan} Plan</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(userData.subscriptionStatus)} className="capitalize">
                      {userData.subscriptionStatus}
                    </Badge>
                    {userData.currentPeriodEnd && (
                       <span className="text-sm text-muted-foreground">
                        {userData.subscriptionStatus === 'trialing' ? 'Trial ends' : 'Renews'} on {getPeriodEndDate()}
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
                        <div className="flex items-center gap-2 text-muted-foreground"><HardDrive className="h-4 w-4" /><span>Sites</span></div>
                        <span className="font-mono text-sm">{userData.usage?.sites || 0} / {planFeatures?.sites || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Cpu className="h-4 w-4" /><span>Bandwidth</span></div>
                        <span className="font-mono text-sm">{userData.usage?.bandwidthGb || 0} GB / {planFeatures?.bandwidthGb || '-'} GB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><MemoryStick className="h-4 w-4" /><span>Analytics</span></div>
                        <span className="font-mono text-sm">{planFeatures?.analytics ? 'Enabled' : 'Disabled'}</span>
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
                    {invoicesLoading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : invoices && invoices.length > 0 ? (
                      invoices.map((invoice, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{new Date(invoice.created * 1000).toLocaleDateString()}</TableCell>
                          <TableCell>${(invoice.amount_paid / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">View Invoice</a>
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
