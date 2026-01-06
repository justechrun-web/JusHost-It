'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { collection, query, orderBy, limit } from 'firebase/firestore';

type AuditLog = {
  id: string;
  actorUid: string;
  type: string;
  orgId: string;
  metadata: Record<string, any>;
  createdAt: { seconds: number; nanoseconds: number } | string;
};

export function AuditLogsTable() {
  const db = useFirestore();
  const auditLogQuery = useMemoFirebase(
    () => db ? query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(100)) : null,
    [db]
  );
  const { data: logs, isLoading } = useCollection<AuditLog>(auditLogQuery);
  const [actorFilter, setActorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const formatDate = (timestamp: AuditLog['createdAt']) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPP p');
    }
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'PPP p');
  };

  const filteredLogs = logs
    ? logs
        .filter((log) =>
          log.actorUid.toLowerCase().includes(actorFilter.toLowerCase())
        )
        .filter((log) =>
          log.type.toLowerCase().includes(typeFilter.toLowerCase())
        )
    : [];

  return (
    <div className="border rounded-lg mt-4">
       <div className="p-4 flex items-center justify-between">
        <div>
            <h3 className="text-xl font-bold tracking-tight">Audit Logs</h3>
            <p className="text-muted-foreground">
                A record of all administrative actions performed on the platform.
            </p>
        </div>
        <div className="flex gap-4">
            <Input
            placeholder="Filter by Actor ID..."
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="max-w-sm"
            />
            <Input
            placeholder="Filter by Type..."
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="max-w-sm"
            />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor ID</TableHead>
            <TableHead>Action Type</TableHead>
            <TableHead>Org ID</TableHead>
            <TableHead>Metadata</TableHead>
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
          ) : (
            filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {log.actorUid}
                </TableCell>
                <TableCell className="font-medium">{log.type}</TableCell>
                <TableCell className="font-mono text-xs">
                  {log.orgId}
                </TableCell>
                 <TableCell className="font-mono text-xs max-w-sm truncate">
                  {JSON.stringify(log.metadata)}
                </TableCell>
              </TableRow>
            ))
          )}
          {!isLoading && filteredLogs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No audit logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
