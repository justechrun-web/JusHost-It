
"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/main-sidebar";
import { Header } from "@/components/header";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuthGate } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const { allowed, loading: isGateLoading } = useAuthGate();
  const router = useRouter();

  React.useEffect(() => {
    // If the user is not loading and there's no user, redirect to login.
    // This allows unauthenticated users to access specific pages like /trust or /sla.
    if (!isUserLoading && !user && !['/trust', '/sla'].includes(pathname)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // Public pages that don't require any auth or billing checks
  if (['/trust', '/sla'].includes(pathname)) {
    return <>{children}</>;
  }
  
  React.useEffect(() => {
    if (!isGateLoading && !allowed) {
      router.push('/billing-required');
    }
  }, [allowed, isGateLoading, router]);

  const isLoading = isUserLoading || isGateLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !allowed) {
    return null; 
  }
  
  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
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
