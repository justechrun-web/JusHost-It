'use client';

import { useFunctions } from '@/firebase';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function UserAction({
  user,
  currentUser,
}: {
  user: any;
  currentUser: User | null;
}) {
  const functions = useFunctions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const toggleRole = async () => {
    if (!user.id) return;
    setLoading(true);
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promoteUser' : 'demoteUser';
    const userAdminAction = httpsCallable(functions, 'userAdminAction');

    try {
      await userAdminAction({ userId: user.id, action: action });
      toast({
        title: 'Success',
        description: `User role changed successfully.`,
      });
    } catch (error: any) {
      console.error('Cloud Function error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'There was a problem updating the user role.',
      });
    } finally {
        setLoading(false);
    }
  };

  const isCurrentUser = currentUser?.uid === user.id;

  return (
    <Button
      onClick={toggleRole}
      variant={user.role === 'admin' ? 'destructive' : 'default'}
      size="sm"
      disabled={isCurrentUser || loading}
      title={isCurrentUser ? "You can't change your own role." : ''}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
    </Button>
  );
}
