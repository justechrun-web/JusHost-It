'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { multiFactor } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      user.getIdTokenResult().then((idTokenResult) => {
        const isAdminClaim = !!idTokenResult.claims.admin;
        setIsAdmin(isAdminClaim);

        if (!isAdminClaim) {
          router.push('/');
          return;
        }

        const isMfaEnabled = multiFactor(user).enrolledFactors.length > 0;
        if (!isMfaEnabled) {
          router.push('/mfa-setup');
        }
      });
    }
  }, [user, loading, router]);
  
  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
