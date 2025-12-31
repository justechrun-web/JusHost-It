"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/main-sidebar";
import { Header } from "@/components/header";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not show the main layout on the admin page, for now.
  if (pathname === '/admin') {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <div className="flex h-full">
        <MainSidebar />
        <main className="flex-1 flex flex-col h-full">
          <Header />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
