'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  Server,
  CreditCard,
  LifeBuoy,
  Settings,
  LogOut,
  Shield,
  MessageSquare,
  BookOpen,
  GraduationCap,
  ShoppingCart,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';


const menuItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutGrid },
  { href: '/sites', label: 'Assignments', icon: Server },
  { href: '/billing', label: 'Messages', icon: MessageSquare, badge: 12 },
  { href: '/support', label: 'Forum', icon: LifeBuoy },
];

const secondaryMenuItems = [
    { href: '/bootcamp', label: 'Bootcamp', icon: BookOpen },
    { href: '/buy-course', label: 'Buy Course', icon: ShoppingCart },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
];


export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      user.getIdTokenResult().then((idTokenResult) => {
        const isAdminClaim = !!idTokenResult.claims.admin;
        setIsAdmin(isAdminClaim);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <GraduationCap className="w-7 h-7 text-sidebar-primary" />
          <span className="font-bold text-lg font-headline text-sidebar-foreground">
            Learnsphere
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4 flex flex-col justify-between">
        <div>
            <div className='px-2 pb-2 text-sm text-muted-foreground'>Main Menu</div>
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    className={cn(
                    pathname.startsWith(item.href) && 'bg-sidebar-accent'
                    )}
                >
                    <Link href={item.href} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                         <item.icon className="h-4 w-4" />
                         <span>{item.label}</span>
                        </div>
                        {item.badge && <Badge variant="secondary" className="h-5">{item.badge}</Badge>}
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
             {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                     className="text-muted-foreground hover:text-foreground"
                >
                    <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </div>
        
        <div className='space-y-4'>
             <div className="bg-card border border-border rounded-lg p-4 text-center space-y-2">
                <p className="text-sm font-semibold">Get Your Certificate</p>
                <p className="text-xs text-muted-foreground">Boost your profile with verified proof of your achievement.</p>
                <Button size="sm" className="w-full bg-primary text-primary-foreground">Get Pro</Button>
            </div>
            {isAdmin && (
                <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    className={cn(
                    pathname.startsWith('/admin') && 'bg-sidebar-accent'
                    )}
                >
                    <Link href="/admin">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                </SidebarMenu>
            )}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between p-2">
              <div className='flex items-center gap-2'>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
                  <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{user?.displayName || 'User'}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}