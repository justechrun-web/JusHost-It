'use client';

import { useMemo } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { CreateSiteDialog } from './components/create-site-dialog';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { format } from 'date-fns';

type Site = {
  id: string;
  domain: string;
  status: 'Active' | 'Suspended' | 'Provisioning';
  plan: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
};

export default function SitesPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const sitesQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'sites'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: sites, loading: sitesLoading } = useCollection<Site>(sitesQuery);

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
  
  const isLoading = userLoading || sitesLoading;

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : sites.length === 0 ? (
               <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  You haven't created any sites yet.
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
                  <TableCell>{site.plan}</TableCell>
                  <TableCell>{formatDate(site.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
