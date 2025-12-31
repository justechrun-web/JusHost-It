'use client';

import { useFunctions } from '@/firebase';
import { Button } from '@/components/ui/button';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function CustomerSiteAction({ site }: { site: any }) {
  const functions = useFunctions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    if (!site.id) return;
    setLoading(true);
    const newStatus = site.status === 'Active' ? 'suspend' : 'resume';
    const customerSiteAction = httpsCallable(functions, 'customerSiteAction');

    try {
      await customerSiteAction({ siteId: site.id, action: newStatus });
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
  const isDestructive = actionText === 'Suspend';

  return (
     <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
            variant={isDestructive ? 'destructive' : 'default'}
            className="w-full"
            disabled={loading || site.status === 'Provisioning'}
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {actionText} Site
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to {actionText.toLowerCase()} this site?</AlertDialogTitle>
          <AlertDialogDescription>
            {isDestructive 
              ? "Suspending this site will make it inaccessible to visitors. Your data will be preserved, but your site will be offline." 
              : "Resuming this site will bring it back online and make it accessible to visitors."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={toggleStatus} className={isDestructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
            Yes, {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
