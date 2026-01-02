'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { httpsCallable } from 'firebase/functions';
import { useFunctions, useUser } from '@/firebase';

type InviteMemberDialogProps = {
  orgId: string;
  children: React.ReactNode;
};

export function InviteMemberDialog({ orgId, children }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const functions = useFunctions();

  const handleInvite = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email is required',
      });
      return;
    }
    setIsLoading(true);
    
    try {
        const inviteUser = httpsCallable(functions, 'inviteUser');
        await inviteUser({ orgId, email, role });
        
        toast({
            title: 'Invitation Sent',
            description: `${email} has been invited to your organization.`,
        });
        setOpen(false);
        setEmail('');
        setRole('member');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Failed to send invitation',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a new member</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to invite and choose their role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as any)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Can manage billing and members</SelectItem>
                <SelectItem value="member">Member - Can create and manage sites</SelectItem>
                <SelectItem value="viewer">Viewer - Can only view sites and usage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleInvite} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
