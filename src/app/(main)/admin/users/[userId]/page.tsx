
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { UserOrgCard } from './components/user-org-card';
import { UserUsageCard } from './components/user-usage-card';
import { UserBillingCard } from './components/user-billing-card';
import { UserDangerZone } from './components/user-danger-zone';

export const dynamic = 'force-dynamic';

type AppUser = {
  id: string;
  email: string;
  displayName: string;
  role?: 'free' | 'paid' | 'admin';
  plan?: 'starter' | 'pro' | 'business';
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'canceled';
  monthlySpend?: number;
  hardCap?: boolean;
};

export default function UserDetailPage() {
  const params = useParams();
  const db = useFirestore();

  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const userRef = useMemoFirebase(
    () => (db && userId ? doc(db, 'users', userId) : null),
    [db, userId]
  );
  
  const { data: user, isLoading, error } = useDoc<AppUser>(userRef);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  // Flatten user and subscription info for easier prop passing to legacy components
  const displayUser = {
    ...user,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    monthlySpend: user.monthlySpend,
    hardCap: user.hardCap,
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Users</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            {user.displayName || user.email}
          </h1>
          <p className="text-muted-foreground">
            Manage user, organization, and billing details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <UserOrgCard user={displayUser} />
            <UserUsageCard />
        </div>
        <div className="space-y-8">
            <UserBillingCard user={displayUser} />
            {user && <UserDangerZone orgId={user.id} />}
        </div>
      </div>
    </div>
  );
}
