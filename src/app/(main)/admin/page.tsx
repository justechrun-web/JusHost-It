'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase';
import { AdminAction } from './components/admin-action';

type Site = {
  id: string;
  domain: string;
  status: 'Active' | 'Suspended' | 'Provisioning';
  plan: string;
  userId: string;
};

export default function AdminDashboard() {
  const { data: sites, loading } = useCollection<Site>('sites');

  const getBadgeVariant = (status: Site['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Admin Panel
        </h1>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
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
                    <Badge variant={getBadgeVariant(site.status)}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{site.plan}</TableCell>
                  <TableCell className="font-mono text-xs">{site.userId}</TableCell>
                  <TableCell className="text-right">
                    <AdminAction site={site} />
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
