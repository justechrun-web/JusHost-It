
'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { multiFactor } from 'firebase/auth';
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
  { name: 'Sites', href: '/admin/sites' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Audit', href: '/admin/audit' },
  { name: 'Metrics', href: '/admin/metrics' },
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
  
  const activeTab = adminTabs.find(tab => pathname === tab.href || (tab.href !== '/admin' && pathname.startsWith(tab.href)))?.href || '/admin';


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
          setLoading(false);
          return;
        }

        const isMfaEnabled = multiFactor(user).enrolledFactors.length > 0;
        if (!isMfaEnabled) {
          router.push('/mfa-setup');
        } else {
          setLoading(false);
        }
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
      <Tabs value={activeTab} className="w-full" onValueChange={(value) => router.push(value)}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
            {adminTabs.map((tab) => (
                <TabsTrigger value={tab.href} key={tab.href}>
                    {tab.name}
                </TabsTrigger>
            ))}
        </TabsList>
        <div className="mt-6">{children}</div>
      </Tabs>
    </div>
  );
}
