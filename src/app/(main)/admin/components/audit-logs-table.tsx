
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { collection, query, orderBy, limit } from 'firebase/firestore';

type AuditLog = {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: { seconds: number; nanoseconds: number } | string;
};

export function AuditLogsTable() {
  const db = useFirestore();
  const auditLogQuery = useMemoFirebase(
    () => db ? query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100)) : null,
    [db]
  );
  const { data: logs, isLoading } = useCollection<AuditLog>(auditLogQuery);
  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const formatDate = (timestamp: AuditLog['timestamp']) => {
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
          log.adminId.toLowerCase().includes(adminFilter.toLowerCase())
        )
        .filter((log) =>
          log.action.toLowerCase().includes(actionFilter.toLowerCase())
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
            placeholder="Filter by Admin ID..."
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="max-w-sm"
            />
            <Input
            placeholder="Filter by Action..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="max-w-sm"
            />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Admin ID</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target ID</TableHead>
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
          ) : (
            filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {log.adminId}
                </TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell className="font-mono text-xs">
                  {log.targetId}
                </TableCell>
              </TableRow>
            ))
          )}
          {!isLoading && filteredLogs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
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
