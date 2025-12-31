"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2, Sparkles } from "lucide-react";
import { useFlow } from "@genkit-ai/next/client";
import { domainNameSuggestions } from "@/ai/flows/domain-name-suggestions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function CreateSiteDialog() {
  const [open, setOpen] = useState(false);
  const [sitePurpose, setSitePurpose] = useState("");
  const [domain, setDomain] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const [run, running] = useFlow(domainNameSuggestions, {
    onSuccess: (result) => {
      setSuggestions(result.suggestions);
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error generating suggestions",
        description: err.message,
      });
    },
  });

  const handleSuggest = async () => {
    if (!sitePurpose) {
      toast({
        variant: "destructive",
        title: "Please enter a site purpose",
        description: "Describe your site to get domain suggestions.",
      });
      return;
    }
    setSuggestions([]);
    await run({ sitePurpose });
  };
  
  const handleSelectSuggestion = (suggestion: string) => {
    setDomain(suggestion);
    setSuggestions([]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Site Creation Initiated",
      description: `Your new site "${domain}" is being provisioned.`,
    });
    setDomain("");
    setSitePurpose("");
    setSuggestions([]);
    setOpen(false);
  }

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
              <Label htmlFor="site-purpose">Site Purpose / Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="site-purpose"
                  placeholder="e.g., 'An online store for handmade pottery'"
                  value={sitePurpose}
                  onChange={(e) => setSitePurpose(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleSuggest} disabled={running}>
                  {running ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="sr-only">Suggest Domains</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Need a domain? Describe your site and we'll suggest some.
              </p>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                      <Badge key={s} variant="secondary" className="cursor-pointer hover:bg-primary/10" onClick={() => handleSelectSuggestion(s)}>
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
              <Select defaultValue="basic">
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Plan ($15/mo)</SelectItem>
                  <SelectItem value="pro">Pro Plan ($30/mo)</SelectItem>
                  <SelectItem value="business">Business Plan ($50/mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Site</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
