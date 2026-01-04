
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, getCountFromServer, where, query } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Server, AlertTriangle } from 'lucide-react';
import { SitesTable } from './components/sites-table';
import { UsersTable } from './components/users-table';

export const dynamic = 'force-dynamic';

const StatCard = ({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  loading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const db = useFirestore();
  const [stats, setStats] = useState({ users: 0, sites: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);

  const usersCol = useMemoFirebase(() => db ? query(collection(db, 'users'), where('role', '!=', 'admin')) : null, [db]);
  const sitesCol = useMemoFirebase(() => db ? collection(db, 'sites') : null, [db]);


  useEffect(() => {
    async function loadStats() {
      if (!db || !usersCol || !sitesCol) return;
      setLoading(true);
      try {
        const usersCountPromise = getCountFromServer(usersCol);
        const sitesCountPromise = getCountFromServer(sitesCol);
        
        const suspendedSitesQuery = query(sitesCol, where('status', '==', 'Suspended'));
        const suspendedCountPromise = getCountFromServer(suspendedSitesQuery);

        const [usersCountSnap, sitesCountSnap, suspendedCountSnap] = await Promise.all([
          usersCountPromise,
          sitesCountPromise,
          suspendedCountPromise
        ]);
        
        setStats({ 
          users: usersCountSnap.data().count, 
          sites: sitesCountSnap.data().count, 
          suspended: suspendedCountSnap.data().count
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [db, usersCol, sitesCol]);

  return (
    <div className='space-y-8'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Total Sites"
          value={stats.sites}
          icon={Server}
          loading={loading}
        />
         <StatCard
          title="Suspended Sites"
          value={stats.suspended}
          icon={AlertTriangle}
          loading={loading}
        />
      </div>
      <div className='space-y-8'>
        <SitesTable />
        <UsersTable />
      </div>
    </div>
  );
}
