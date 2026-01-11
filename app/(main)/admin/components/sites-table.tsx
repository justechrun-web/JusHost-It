'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { AdminAction } from './admin-action';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, limit } from 'firebase/firestore';


type Site = {
  id: string;
  domain: string;
  status: 'Active' | 'Suspended' | 'Provisioning';
  plan: string;
  orgId: string;
  billingStatus?: 'active' | 'past_due' | 'canceled';
};

export function SitesTable() {
  const db = useFirestore();
  // In a real app with many sites, you would get all orgs then query sites for each.
  // For this demo, we'll query a root 'sites' collection which is less scalable but simpler.
  const sitesQuery = useMemoFirebase(
    () => db ? query(collection(db, 'sites'), orderBy('domain'), limit(50)) : null,
    [db]
  );
  const { data: sites, isLoading } = useCollection<Site>(sitesQuery);


  const getStatusBadgeVariant = (status: Site['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getBillingStatusClass = (billingStatus?: Site['billingStatus']) => {
    switch (billingStatus) {
      case 'active':
        return 'text-green-600';
      case 'past_due':
      case 'canceled':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="border rounded-lg mt-4">
        <div className="p-4">
             <h3 className="text-xl font-bold tracking-tight">Site Management</h3>
             <p className="text-muted-foreground">
                View and manage all customer sites on the platform.
            </p>
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Billing Status</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Org ID</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </TableCell>
            </TableRow>
          ) : sites && sites.length > 0 ? (
            sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell className="font-medium">{site.domain}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(site.status)}>
                    {site.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    'capitalize font-medium',
                    getBillingStatusClass(site.billingStatus)
                  )}
                >
                  {site.billingStatus || 'N/A'}
                </TableCell>
                <TableCell>{site.plan}</TableCell>
                <TableCell className="font-mono text-xs">
                  {site.orgId}
                </TableCell>
                <TableCell className="text-right">
                  <AdminAction site={site} />
                </TableCell>
              </TableRow>
            ))
          ) : (
             <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No sites found.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
