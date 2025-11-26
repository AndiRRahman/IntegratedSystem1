import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from '@/lib/definitions'
import Link from 'next/link'
import { LayoutDashboard, LogOut, Package, User as UserIcon } from 'lucide-react'
import { logout } from '@/lib/actions'

export function UserNav({ user }: { user: User }) {
  const initials = user.name.split(' ').map(n => n[0]).join('');

  return (
    <form action={logout}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={`@${user.name}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /><span>Profile</span></Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders"><Package className="mr-2 h-4 w-4" /><span>My Orders</span></Link>
            </DropdownMenuItem>
            {user.role === 'ADMIN' && (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </form>
  )
}
