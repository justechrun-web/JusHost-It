'use client';

import { doc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';

export function UserAction({
  user,
  currentUser,
}: {
  user: any;
  currentUser: User | null;
}) {
  const db = useFirestore();

  const toggleRole = async () => {
    if (!user.id) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
      role: newRole,
    });
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
