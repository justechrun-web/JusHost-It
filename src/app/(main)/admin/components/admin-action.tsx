'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';

export function AdminAction({ site }: { site: any }) {
  const db = useFirestore();

  const toggleStatus = async () => {
    if (!site.id) return;
    const newStatus = site.status === 'Active' ? 'Suspended' : 'Active';
    const siteRef = doc(db, 'sites', site.id);
    await updateDoc(siteRef, {
      status: newStatus,
    });
    // Later: call backend to stop/start container
  };

  return (
    <Button
      onClick={toggleStatus}
      variant={site.status === 'Active' ? 'destructive' : 'default'}
      size="sm"
    >
      {site.status === 'Active' ? 'Suspend' : 'Resume'}
    </Button>
  );
}
