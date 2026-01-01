
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UserOrgCard({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User & Organization</CardTitle>
        <CardDescription>
          Core details for the user and their associated organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">User Details</h4>
          <div>
            <Label>Display Name</Label>
            <Input defaultValue={user.displayName} disabled />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user.email} disabled />
          </div>
          <div>
            <Label>User ID</Label>
            <Input defaultValue={user.id} disabled className="font-mono text-xs" />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Organization Details</h4>
          <div>
            <Label>Organization Name</Label>
            <Input defaultValue={user.company || 'N/A'} disabled />
          </div>
          <div>
            <Label>Role</Label>
            <div>
              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                {user.role || 'user'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
