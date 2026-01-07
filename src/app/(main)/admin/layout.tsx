'use client';

import * as React from 'react';
import { useUser } from '@/firebase/provider';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const adminTabs = [
  { name: 'Overview', href: '/admin' },
  { name: 'Metrics', href: '/admin/metrics' },
  { name: 'Audit', href: '/admin/audit' },
  { name: 'Support', href: '/admin/support' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  const activeTab = adminTabs.find(tab => pathname.startsWith(tab.href))?.href || '/admin';


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
    <div>
      {children}
    </div>
  );
}
