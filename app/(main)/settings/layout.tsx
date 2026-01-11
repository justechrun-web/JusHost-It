'use client';

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import { User, Building, CreditCard } from 'lucide-react';

const settingsTabs = [
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Organization', href: '/settings/organization', icon: Building },
    { name: 'Payment Method', href: '/settings/payment-method', icon: CreditCard },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = settingsTabs.find(tab => pathname.startsWith(tab.href))?.href || '/settings/profile';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
                Manage your personal, organizational, and payment settings.
            </p>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => router.push(value)}>
            <TabsList>
                {settingsTabs.map((tab) => (
                    <TabsTrigger value={tab.href} key={tab.href}>
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.name}
                    </TabsTrigger>
                ))}
            </TabsList>
            <div className="mt-6">
                {children}
            </div>
        </Tabs>
    </div>
  );
}
