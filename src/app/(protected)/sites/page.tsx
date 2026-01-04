
'use client';

import {
  collection,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateSiteDialog } from '@/app/(main)/sites/components/create-site-dialog';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Site = {
  id: string;
  domain: string;
  status: 'Active' | 'Suspended' | 'Provisioning';
  plan: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
};

export default function SitesPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // In a real app with multiple orgs, you'd get this from the user's session/claims.
  // For now, we assume the orgId is the user's UID (if they created the org).
  const orgId = user?.uid;

  const sitesQuery = useMemoFirebase(() => {
    if (!orgId || !db) return null;
    return query(
      collection(db, `orgs/${orgId}/sites`),
      orderBy('createdAt', 'desc')
    );
  }, [db, orgId]);

  const { data: sites, isLoading: sitesLoading } = useCollection<Site>(sitesQuery);

  const formatDate = (timestamp: Site['createdAt']) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPP');
    }
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'PPP');
  };
  
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
  
  const isLoading = isUserLoading || sitesLoading;

  const handleRowClick = (siteId: string) => {
    router.push(`/sites/${siteId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            My Sites
          </h1>
          <p className="text-muted-foreground">
            Manage your websites, domains, and hosting plans.
          </p>
        </div>
        <CreateSiteDialog />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : sites && sites.length === 0 ? (
               <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  You haven't created any sites yet.
                </TableCell>
              </TableRow>
            ) : (
              sites && sites.map((site) => (
                <TableRow key={site.id} onClick={() => handleRowClick(site.id)} className="cursor-pointer">
                  <TableCell className="font-medium">{site.domain}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(site.status)}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{site.plan}</TableCell>
                  <TableCell>{formatDate(site.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
