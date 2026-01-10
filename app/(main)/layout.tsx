'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { Header } from '@/components/header';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <MainSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The admin layout handles its own structure.
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
