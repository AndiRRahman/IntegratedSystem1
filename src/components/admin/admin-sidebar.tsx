'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { logout } from '@/lib/actions';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: Package, label: 'Orders' },
  { href: '/admin/products', icon: ShoppingBag, label: 'Products' },
  // { href: '/admin/customers', icon: Users, label: 'Customers' },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 border-r bg-background p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7l-2 5H4L2 7"/></svg>
                <h1 className="font-headline text-2xl font-bold">Admin</h1>
            </div>
            <nav className="flex flex-col gap-2 flex-grow">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === link.href && "bg-accent/10 text-primary font-medium"
                        )}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto">
                <form action={logout}>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                        <LogOut className="h-4 w-4"/>
                        Logout
                    </Button>
                </form>
            </div>
        </aside>
    );
}
