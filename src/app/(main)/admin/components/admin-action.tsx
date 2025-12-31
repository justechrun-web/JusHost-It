'use client';

import { useFunctions } from '@/firebase';
import { Button } from '@/components/ui/button';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';

export function AdminAction({ site }: { site: any }) {
  const functions = useFunctions();
  const { toast } = useToast();

  const toggleStatus = async () => {
    if (!site.id) return;
    const newStatus = site.status === 'Active' ? 'suspend' : 'resume';
    const adminSiteAction = httpsCallable(functions, 'adminSiteAction');

    try {
      await adminSiteAction({ siteId: site.id, action: newStatus });
      toast({
        title: 'Success',
        description: `Site status changed successfully.`,
      });
      // The Firestore listener will update the UI automatically
    } catch (error: any) {
      console.error('Cloud Function error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'There was a problem updating the site status.',
      });
    }
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
