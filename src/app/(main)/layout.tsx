"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/main-sidebar";
import { Header } from "@/components/header";
import { usePathname, useRouter } from "next/navigation";
import { useAuthGate } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { allowed, loading } = useAuthGate();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) {
      return;
    }

    if (!allowed) {
      if (pathname.startsWith('/admin')) {
        router.push('/login');
      } else {
        router.push('/billing-required');
      }
    }
  }, [allowed, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If still loading or not allowed, render nothing to prevent component flicker.
  if (!allowed) {
    return null;
  }
  
  // The admin layout handles its own structure.
  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-muted/40">
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
