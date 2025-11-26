import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/shared/user-nav';
import type { User } from '@/lib/definitions';
import { ShoppingCart, Package, Home, User as UserIcon } from 'lucide-react';

export function Header({ session }: { session: User | null }) {
  const isAdmin = session?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7l-2 5H4L2 7"/></svg>
          <span className="font-headline font-bold sm:inline-block text-xl">
            E-Commers V
          </span>
        </Link>
        
        {session && (
           <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
             <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"><Home /> Home</Link>
             <Link href="/cart" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"><ShoppingCart/> Cart</Link>
             <Link href="/orders" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"><Package/> Orders</Link>
             <Link href="/profile" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"><UserIcon/> Profile</Link>
             {isAdmin && <Link href="/admin/dashboard" className="transition-colors text-primary hover:text-primary/80 font-bold">Admin Dashboard</Link>}
           </nav>
        )}

        <div className="flex flex-1 items-center justify-end space-x-4">
          {session ? (
            <UserNav user={session} />
          ) : (
            <nav className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
