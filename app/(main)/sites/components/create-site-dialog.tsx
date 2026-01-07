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
import { suggestDomainsAction } from "@/app/actions/suggest-domains";

export function CreateSiteDialog() {
  const [open, setOpen] = useState(false);
  const [sitePurpose, setSitePurpose] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState('basic');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionRunning, setSuggestionRunning] = useState(false);
  const { toast } = useToast();
  const [createRunning, setCreateRunning] = useState(false);
  const functions = useFunctions();
  const { user } = useUser();

  const handleSuggest = async () => {
    if (!sitePurpose) {
      toast({
        variant: 'destructive',
        title: 'Please describe your site first.',
      });
      return;
    }
    setSuggestionRunning(true);
    try {
      const result = await suggestDomainsAction({ keywords: sitePurpose });
      setSuggestions(result.domains);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Could not generate suggestions.',
      });
    } finally {
      setSuggestionRunning(false);
    }
  };

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
      const createSite = httpsCallable(functions, 'createSite');
      await createSite({ domain, plan });

      toast({
        title: 'Site Creation Initiated',
        description: `Your new site "${domain}" is being provisioned. This may take a few minutes.`,
      });
      setDomain('');
      setSitePurpose('');
      setSuggestions([]);
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
          <PlusCircle className="mr-2 h-4" />
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
              <Label htmlFor="purpose">
                What is the purpose of your site?
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="purpose"
                  placeholder="e.g., A portfolio for my design work"
                  value={sitePurpose}
                  onChange={(e) => setSitePurpose(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSuggest}
                  disabled={suggestionRunning}
                >
                  {suggestionRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      setDomain(s);
                      setSuggestions([]);
                    }}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            )}
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
