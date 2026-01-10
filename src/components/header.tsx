'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Settings, User, LifeBuoy, LogOut, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { Input } from './ui/input';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search anything and everything" className="pl-10 bg-card border-border" />
        </div>
        
        <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full"
                >
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/billing">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/support">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
