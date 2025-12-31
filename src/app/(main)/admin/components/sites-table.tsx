
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
import { useCollection } from '@/firebase';
import { AdminAction } from './admin-action';
import { cn } from '@/lib/utils';

type Site = {
  id: string;
  domain: string;
  status: 'Active' | 'Suspended' | 'Provisioning';
  plan: string;
  ownerId: string;
  billingStatus: 'active' | 'past_due' | 'canceled';
};

export function SitesTable() {
  const { data: sites, loading } = useCollection<Site>('sites');

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

  const getBillingStatusClass = (billingStatus: Site['billingStatus']) => {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Billing Status</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Owner ID</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </TableCell>
            </TableRow>
          ) : (
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
                  {site.ownerId}
                </TableCell>
                <TableCell className="text-right">
                  <AdminAction site={site} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
