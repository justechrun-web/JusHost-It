
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type UserData = {
  id: string;
  email: string;
  role: string;
  subscription?: {
    status: string;
  };
};

export default function AdminBilling() {
  const db = useFirestore();
  const { user } = useUser();
  const usersQuery = useMemoFirebase(() => db ? query(collection(db, 'users')) : null, [db]);
  const { data: users, isLoading } = useCollection<UserData>(usersQuery);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Billing Admin</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (
              users?.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <strong className="font-mono text-xs">{u.id}</strong>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.subscription?.status || 'N/A'}</TableCell>
                  <TableCell>
                    <form action={`/api/admin/upgrade`} method="POST" className="flex gap-2 items-center">
                      <input type="hidden" name="uid" value={u.id} />
                      <input type="hidden" name="adminId" value={user?.uid || ''} />
                      <select name="plan" defaultValue={u.role} className="border rounded px-2 py-1 text-sm bg-background">
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                      <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90">
                        Change Plan
                      </button>
                    </form>
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
