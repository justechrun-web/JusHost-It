
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Server,
  HardDrive,
  Globe,
  Signal,
  Loader2,
} from 'lucide-react';
import { RecentSites } from '../components/recent-sites';
import { ResourceUsageChart } from '../components/resource-usage-chart';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ActiveAlerts } from '../components/active-alerts';

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value: string, icon: React.ElementType, loading: boolean }) => (
    <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
         <div className="pt-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
         </div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  
  const userRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: userData, isLoading: isUserLoading } = useDoc(userRef);

  const statCards = [
    { title: 'Active Sites', value: userData?.sites || '0', icon: Server, loading: isUserLoading },
    { title: 'Storage Used', value: `${userData?.storageUsed || '0'} GB`, icon: HardDrive, loading: isUserLoading },
    { title: 'Bandwidth', value: `${userData?.bandwidthUsed || '0'} GB`, icon: Globe, loading: isUserLoading },
    { title: 'Uptime', value: '99.98%', icon: Signal, loading: false },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a quick overview of your account.
        </p>
      </div>

      <ActiveAlerts />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              A summary of your bandwidth and storage usage for the last 6
              months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceUsageChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sites</CardTitle>
            <CardDescription>
              A list of your most recently managed sites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSites />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
