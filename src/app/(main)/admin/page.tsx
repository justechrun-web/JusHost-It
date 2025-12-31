'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SitesTable } from './components/sites-table';
import { UsersTable } from './components/users-table';
import { AuditLogsTable } from './components/audit-logs-table';
import { ResourceMetrics } from './components/resource-metrics';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('sites');

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="sites">
          <SitesTable />
        </TabsContent>
        <TabsContent value="users">
          <UsersTable />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogsTable />
        </TabsContent>
        <TabsContent value="metrics">
          <ResourceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
