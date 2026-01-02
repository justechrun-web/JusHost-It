
'use client';

import { useFunctions } from '@/firebase';
import { Button } from '@/components/ui/button';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function AdminAction({ site }: { site: any }) {
  const functions = useFunctions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    if (!site.id) return;
    setLoading(true);
    const newStatus = site.status === 'Active' ? 'suspend' : 'resume';
    const adminSiteAction = httpsCallable(functions, 'adminSiteAction');

    try {
      await adminSiteAction({ siteId: site.id, action: newStatus });
      toast({
        title: 'Success',
        description: `Site status change initiated.`,
      });
    } catch (error: any) {
      console.error('Cloud Function error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'There was a problem updating the site status.',
      });
    } finally {
        setLoading(false);
    }
  };

  const actionText = site.status === 'Active' ? 'Suspend' : 'Resume';

  return (
    <Button
      onClick={toggleStatus}
      variant={site.status === 'Active' ? 'destructive' : 'default'}
      size="sm"
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {actionText}
    </Button>
  );
}
