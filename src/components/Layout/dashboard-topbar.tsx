'use client'

import { ChevronDown, LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

import { MessageBell } from '@/components/messages'
import { NotificationBell } from '@/components/notifications'
import {
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isSupervisorRole } from '@/lib/auth/roles'
import { useLogout, useUser } from '@/lib/hooks'

/**
 * Route-to-title map for the topbar page title.
 * Prefix matching is used for dynamic segments (e.g. /supervisors/[id]).
 */
const PAGE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: '/dashboard', title: 'Dashboard' },
  { prefix: '/supervisors', title: 'Find Supervisors' },
  { prefix: '/supervisees', title: 'Supervisees' },
  { prefix: '/hires', title: 'Hired Supervisors' },
  { prefix: '/supervision-requests', title: 'Supervision Requests' },
  { prefix: '/billing', title: 'Billing & Invoices' },
  { prefix: '/settings', title: 'Settings' },
  { prefix: '/user', title: 'User Profile' },
]

function resolvePageTitle(pathname: string): string {
  const match = PAGE_TITLES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + '/'),
  )
  return match?.title ?? 'Dashboard'
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export function DashboardTopbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const logout = useLogout()

  const displayName = user?.fullName ?? user?.name ?? ''
  const initials = getInitials(displayName)
  const sectionLabel = isSupervisorRole(user?.role) ? 'Supervisor Portal' : 'Supervisee Portal'
  const pageTitle = resolvePageTitle(pathname)

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-white px-8">
      {/* Left: contextual section label + current page title */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {sectionLabel}
        </span>
        <span className="text-[15px] font-semibold leading-none text-foreground">{pageTitle}</span>
      </div>

      {/* Right: notification bell + user avatar/name dropdown */}
      <div className="flex items-center gap-2">
        <MessageBell />
        <NotificationBell />

        {/* User menu */}
        <DropdownMenuRoot>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {user?.profilePhotoUrl ? (
              <Image
                src={user.profilePhotoUrl}
                alt={displayName}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {initials}
              </span>
            )}
            <span className="hidden max-w-[140px] truncate sm:block">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuPositioner>
              <DropdownMenuPopup>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4 shrink-0" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4 shrink-0" />
                  {logout.isPending ? 'Signing out…' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuPopup>
            </DropdownMenuPositioner>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
    </header>
  )
}
