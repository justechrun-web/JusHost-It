'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      user.getIdTokenResult().then((idTokenResult) => {
        const isAdminClaim = !!idTokenResult.claims.admin;
        setIsAdmin(isAdminClaim);

        if (!isAdminClaim) {
          router.push('/dashboard');
        }
        setLoading(false);
      });
    }
  }, [user, isUserLoading, router]);
  
  if (loading || isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    // This state is briefly hit before redirection, returning null prevents flicker.
    return null;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Admin Panel
        </h1>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
