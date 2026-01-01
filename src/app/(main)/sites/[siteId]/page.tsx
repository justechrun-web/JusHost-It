'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Loader2, ArrowLeft, Cpu, MemoryStick, HardDrive, CheckCircle, Clock, XCircle, Power } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { CustomerSiteAction } from './components/customer-site-action';
import { doc } from 'firebase/firestore';

type SiteEvent = {
  type: string;
  message: string;
  timestamp: { seconds: number; nanoseconds: number } | string;
};

type Site = {
  id: string;
  domain: string;
  status: 'Active' | 'Suspended' | 'Provisioning' | 'Error';
  plan: string;
  region?: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
  events?: SiteEvent[];
};

const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp.seconds * 1000);
    return format(date, 'PPP p');
};

const getStatusBadgeVariant = (status: Site['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Suspended':
      case 'Error':
        return 'destructive';
      default:
        return 'secondary';
    }
};

const getEventIcon = (type: string) => {
    switch (type) {
        case 'provisioned':
        case 'resumed':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'suspended':
        case 'deleted':
             return <XCircle className="h-4 w-4 text-red-500" />;
        case 'created':
            return <Power className="h-4 w-4 text-blue-500" />;
        default:
            return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
};

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const siteId = Array.isArray(params.siteId) ? params.siteId[0] : params.siteId;
  
  const siteRef = useMemoFirebase(() => {
    if (!user || !db || !siteId) return null;
    return doc(db, `users/${user.uid}/sites`, siteId);
  }, [db, user, siteId]);

  const {
    data: site,
    isLoading: isSiteLoading,
    error,
  } = useDoc<Site>(siteRef);
  
  const isLoading = isSiteLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Site not found or you don't have access.</p>
          <Button variant="outline" asChild>
            <Link href="/sites">Go Back to Sites</Link>
          </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/sites">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Sites</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{site.domain}</h1>
          <p className="text-muted-foreground">Detailed view of your site and controls.</p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Site Overview</CardTitle>
                    <CardDescription>Key details about your deployment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="font-medium text-muted-foreground">Domain</div>
                        <div>{site.domain}</div>

                        <div className="font-medium text-muted-foreground">Status</div>
                        <div><Badge variant={getStatusBadgeVariant(site.status)}>{site.status}</Badge></div>

                        <div className="font-medium text-muted-foreground">Plan</div>
                        <div>{site.plan}</div>

                        <div className="font-medium text-muted-foreground">Region</div>
                        <div>{site.region || 'us-east-1'}</div>

                        <div className="font-medium text-muted-foreground">Created At</div>
                        <div>{formatDate(site.createdAt)}</div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Event Timeline</CardTitle>
                    <CardDescription>A log of important events for your site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {(site.events || []).sort((a,b) => (b.timestamp as any).seconds - (a.timestamp as any).seconds).map((event, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                {getEventIcon(event.type)}
                            </div>
                            <div>
                            <p className="font-medium">{event.message}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(event.timestamp)} ({formatDistanceToNow(new Date(formatDate(event.timestamp)))} ago)</p>
                            </div>
                        </div>
                        ))}
                        {(!site.events || site.events.length === 0) && (
                            <p className="text-center text-sm text-muted-foreground py-4">No events have been recorded yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Manage your site's status.</CardDescription>
            </CardHeader>
            <CardContent>
                <CustomerSiteAction site={site} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Live telemetry from your containers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Cpu className="h-4 w-4" />
                        <span>CPU</span>
                    </div>
                    <span className="font-mono text-sm">0.2%</span>
                </div>
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MemoryStick className="h-4 w-4" />
                        <span>Memory</span>
                    </div>
                    <span className="font-mono text-sm">128 MB / 512 MB</span>
                </div>
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="h-4 w-4" />
                        <span>Disk</span>
                    </div>
                    <span className="font-mono text-sm">1.2 GB / 25 GB</span>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
