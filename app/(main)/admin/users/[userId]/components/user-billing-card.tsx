'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function UserBillingCard({ user }: { user: any }) {

 const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'success';
      case 'past_due':
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Plan</CardTitle>
        <CardDescription>
          Manage subscription, budget, and hard caps for this organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label>Subscription Status</Label>
            <div>
              <Badge variant={getStatusBadgeVariant(user.subscriptionStatus)} className="capitalize">
                {user.subscriptionStatus || 'N/A'}
              </Badge>
            </div>
        </div>
         <div className="space-y-2">
            <Label>Current Plan</Label>
            <Select defaultValue={user.plan}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Plan ($15/mo)</SelectItem>
                <SelectItem value="pro">Pro Plan ($30/mo)</SelectItem>
                <SelectItem value="business">Business Plan ($50/mo)</SelectItem>
              </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label>Current Spend / Budget</Label>
             <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="number" defaultValue={user.monthlySpend || 0} className="pl-8" />
            </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label htmlFor="hard-cap" className="font-semibold">Hard Cap Enforcement</Label>
                <p className="text-xs text-muted-foreground">Suspend services if budget is exceeded.</p>
            </div>
            <Switch id="hard-cap" checked={user.hardCap} />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 items-stretch">
        <Button>Save Changes</Button>
        <Button variant="outline">View Invoices in Stripe</Button>
      </CardFooter>
    </Card>
  );
}
