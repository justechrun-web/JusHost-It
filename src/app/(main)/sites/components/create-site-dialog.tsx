'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { httpsCallable } from 'firebase/functions';
import { useFunctions, useUser } from '@/firebase';

export function CreateSiteDialog() {
  const [open, setOpen] = useState(false);
  const [sitePurpose, setSitePurpose] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState('basic');
  const { toast } = useToast();
  const [createRunning, setCreateRunning] = useState(false);
  const functions = useFunctions();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'You must be logged in to create a site.',
      });
      return;
    }
    setCreateRunning(true);

    try {
      // This Cloud Function is the secure entrypoint to the provisioning pipeline.
      // It will authenticate the user, check their plan limits, and then
      // trigger the Kubernetes resource creation you've designed.
      const createSite = httpsCallable(functions, 'createSite');
      await createSite({ domain, plan });

      toast({
        title: 'Site Creation Initiated',
        description: `Your new site "${domain}" is being provisioned. This may take a few minutes.`,
      });
      setDomain('');
      setSitePurpose('');
      setOpen(false);
    } catch (error: any) {
      console.error('Cloud Function error:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating site',
        description:
          error.message || 'There was a problem provisioning your site. Please contact support if the issue persists.',
      });
    } finally {
      setCreateRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Site</DialogTitle>
            <DialogDescription>
              Enter the details for your new website. We'll handle the rest.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">Hosting Plan</Label>
              <Select
                value={plan}
                onValueChange={setPlan}
                defaultValue="basic"
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Plan ($15/mo)</SelectItem>
                  <SelectItem value="pro">Pro Plan ($30/mo)</SelectItem>
                  <SelectItem value="business">
                    Business Plan ($50/mo)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createRunning}>
              {createRunning && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Provision Site
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
