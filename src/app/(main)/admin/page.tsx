'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Server } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
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
  const [stats, setStats] = useState({ users: 0, sites: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!db) return;
      try {
        const usersPromise = getDocs(collection(db, 'users'));
        const sitesPromise = getDocs(collection(db, 'sites'));
        const [usersSnap, sitesSnap] = await Promise.all([
          usersPromise,
          sitesPromise,
        ]);
        setStats({ users: usersSnap.size, sites: sitesSnap.size });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [db]);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight mb-8">
        Admin Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Active Sites"
          value={stats.sites}
          icon={Server}
          loading={loading}
        />
      </div>
    </div>
  );
}
