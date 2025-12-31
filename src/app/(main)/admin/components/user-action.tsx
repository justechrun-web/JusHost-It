'use client';

import { useFunctions } from '@/firebase';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';

export function UserAction({
  user,
  currentUser,
}: {
  user: any;
  currentUser: User | null;
}) {
  const functions = useFunctions();
  const { toast } = useToast();

  const toggleRole = async () => {
    if (!user.id) return;
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
    }
  };

  const isCurrentUser = currentUser?.uid === user.id;

  return (
    <Button
      onClick={toggleRole}
      variant={user.role === 'admin' ? 'destructive' : 'default'}
      size="sm"
      disabled={isCurrentUser}
      title={isCurrentUser ? "You can't change your own role." : ''}
    >
      {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
    </Button>
  );
}
