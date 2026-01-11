'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { UserAction } from './user-action';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { collection, query, orderBy, limit } from 'firebase/firestore';


type AppUser = {
  id: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt: { seconds: number; nanoseconds: number } | string;
  company?: string;
};

export function UsersTable() {
  const db = useFirestore();
  const router = useRouter();
  const usersQuery = useMemoFirebase(
    () => db ? query(collection(db, 'users'), orderBy('email'), limit(50)) : null,
    [db]
  );
  const { data: users, isLoading } = useCollection<AppUser>(usersQuery);
  const { user: currentUser } = useUser();

  const formatDate = (timestamp: AppUser['createdAt']) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPP');
    }
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'PPP');
  };

  const handleRowClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div className="border rounded-lg mt-4">
        <div className="p-4">
            <h3 className="text-xl font-bold tracking-tight">User Management</h3>
            <p className="text-muted-foreground">
                Promote or demote users to administrators. Click a user to see details.
            </p>
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Date Joined</TableHead>
            <TableHead className="text-right">Action</TableHead>
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
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id} onClick={() => handleRowClick(user.id)} className="cursor-pointer">
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                  >
                    {user.role || 'user'}
                  </Badge>
                </TableCell>
                <TableCell>{(user as any).company || 'N/A'}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <UserAction user={user} currentUser={currentUser} />
                </TableCell>
              </TableRow>
            ))
          ): (
             <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
