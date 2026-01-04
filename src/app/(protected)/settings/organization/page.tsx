
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreVertical, Trash2, UserPlus } from 'lucide-react';
import { useCollection, useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InviteMemberDialog } from '@/app/(main)/settings/organization/components/invite-member-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type OrgMember = {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
};

type Invite = {
    id: string;
    email: string;
    role: 'admin' | 'member' | 'viewer';
    status: 'pending' | 'accepted' | 'declined';
}

export default function OrganizationSettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, `users/${user.uid}`);
  }, [db, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{orgId: string}>(userDocRef);
  const orgId = userData?.orgId;

  const membersQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(db, 'orgMembers'), where('orgId', '==', orgId));
  }, [db, orgId]);

  const { data: members, isLoading: isMembersLoading } = useCollection<OrgMember>(membersQuery);

  const invitesQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(db, 'orgInvitations'), where('orgId', '==', orgId), where('status', '==', 'pending'));
  }, [db, orgId]);

  const { data: invitations, isLoading: isInvitesLoading } = useCollection<Invite>(invitesQuery);

  const allMembers = [
    ...(members || []),
    ...(invitations?.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: 'invited'
    })) || [])
  ];

  const isLoading = isUserLoading || isUserDataLoading || isMembersLoading || isInvitesLoading;

  const getRoleBadgeVariant = (role: OrgMember['role']) => {
    switch (role) {
      case 'owner':
        return 'destructive';
      case 'admin':
        return 'success';
      case 'member':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
                Manage who can access your organization and their permissions.
            </CardDescription>
        </div>
        {orgId && 
          <InviteMemberDialog orgId={orgId}>
              <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
              </Button>
          </InviteMemberDialog>
        }
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : allMembers.length > 0 ? (
              allMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={(member as any).status === 'invited' ? 'accent' : 'secondary'} className="capitalize">
                      {(member as any).status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(member as any).status !== 'invited' && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem disabled={member.role === 'owner'}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            <span className="text-destructive">Remove Member</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  You are the only member of this organization.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
