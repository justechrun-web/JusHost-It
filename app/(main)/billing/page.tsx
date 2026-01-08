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

export const dynamic = 'force-dynamic';

type OrgData = {
  plan: 'starter' | 'pro' | 'business' | 'free';
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: { seconds: number };
};

type UsageData = {
  sites: number;
  bandwidthGb: number;
  storageGb: number;
}

export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  // First, get the user's orgId
  const userDocRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, `users/${user.uid}`);
  }, [db, user]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{orgId: string, primarySiteId?: string}>(userDocRef);
  const orgId = userData?.orgId;
  const primarySiteId = userData?.primarySiteId; // Assuming you have a primary site for charting

  // Then, fetch the organization and usage data
  const orgRef = useMemoFirebase(() => {
    if (!userData?.orgId || !db) return null;
    return doc(db, `orgs/${userData.orgId}`);
  }, [db, userData]);

  const usageRef = useMemoFirebase(() => {
    if (!userData?.orgId || !db) return null;
    return doc(db, `orgUsage/${userData.orgId}`);
  }, [db, userData]);

  const { data: orgData, isLoading: isOrgLoading } = useDoc<OrgData>(orgRef);
  const { data: usageData, isLoading: isUsageLoading } = useDoc<UsageData>(usageRef);

  const planFeatures = orgData?.plan ? FEATURES[orgData.plan as keyof typeof FEATURES] : FEATURES['starter'];

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
        if (new URL(url).hostname === 'billing.stripe.com') {
          window.location.href = url;
        } else {
          throw new Error('Invalid redirect URL received.');
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      setIsPortalLoading(false);
    }
  };

  const isLoading = isUserLoading || isUserDataLoading || isOrgLoading || isUsageLoading;
  
  const getStatusBadgeVariant = (status?: OrgData['subscriptionStatus']) => {
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
    if(!orgData?.currentPeriodEnd) return '';
    const date = new Date(orgData.currentPeriodEnd.seconds * 1000);
    return date.toLocaleDateString();
  }

  const isValidStripeUrl = (url: string) => {
    try {
      if (!url) return false;
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' && parsedUrl.hostname.endsWith('.stripe.com');
    } catch (e) {
      return false;
    }
  };


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
      ) : !orgData || !orgData.subscriptionStatus ? (
         <Card className="text-center p-8">
          <CardTitle>No Subscription Found</CardTitle>
          <CardDescription className="mt-2">Your organization does not have an active subscription.</CardDescription>
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
                <CardDescription>Your organization's subscription.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-2xl font-semibold capitalize">{orgData.plan} Plan</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(orgData.subscriptionStatus)} className="capitalize">
                      {orgData.subscriptionStatus}
                    </Badge>
                    {orgData.currentPeriodEnd && (
                       <span className="text-sm text-muted-foreground">
                        {orgData.subscriptionStatus === 'trialing' ? 'Trial ends' : 'Renews'} on {getPeriodEndDate()}
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
                        <span className="font-mono text-sm">{usageData?.sites || 0} / {planFeatures?.sites || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Cpu className="h-4 w-4" /><span>Bandwidth</span></div>
                        <span className="font-mono text-sm">{usageData?.bandwidthGb || 0} GB / {planFeatures?.bandwidthGb || '-'} GB</span>
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
                <CardDescription>Real-time CPU usage for your primary site.</CardDescription>
              </CardHeader>
              <CardContent>
                {orgId && primarySiteId ? (
                   <ResourceUsageChart orgId={orgId} siteId={primarySiteId} />
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                        No primary site configured to display metrics.
                    </div>
                )}
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
                      invoices.map((invoice, index) => {
                        const isSafeUrl = isValidStripeUrl(invoice.invoice_pdf);
                        return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{new Date(invoice.created * 1000).toLocaleDateString()}</TableCell>
                          <TableCell>${(invoice.amount_paid / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild disabled={!isSafeUrl}>
                              <a href={isSafeUrl ? invoice.invoice_pdf : undefined} target="_blank" rel="noopener noreferrer">Download PDF</a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )})
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
