'use client'

import {
  Briefcase,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { TOKEN_KEY } from '@/lib/api/client'
import { isSuperviseeRole, isSupervisorRole } from '@/lib/auth/roles'
import { usePendingRequestsCount, useUser } from '@/lib/hooks'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Find Supervisors', href: '/supervisors', icon: Users, superviseeOnly: true },
  { label: 'Hired Supervisors', href: '/hires', icon: Briefcase, superviseeOnly: true },
  { label: 'Supervisees', href: '/supervisees', icon: UserCheck, supervisorOnly: true },
  {
    label: 'Supervision Requests',
    href: '/supervision-requests',
    icon: ClipboardList,
    supervisorOnly: true,
  },
  { label: 'Billing & Invoices', href: '/billing', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { data: pendingCount } = usePendingRequestsCount(isSupervisorRole(user?.role))

  const visibleNavItems = navItems.filter((item) => {
    if ('superviseeOnly' in item && item.superviseeOnly) {
      return user ? isSuperviseeRole(user.role) : false
    }
    if ('supervisorOnly' in item && item.supervisorOnly) {
      return user ? !isSuperviseeRole(user.role) : false
    }
    return true
  })

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/login'
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <Link href="/" className="flex h-16 items-center gap-2 border-b px-6">
        <Image
          src="/logo.png"
          alt="Find A Supervisor"
          width={120}
          height={32}
          className="h-8 w-auto"
        />
      </Link>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {visibleNavItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          const badge =
            href === '/supervision-requests' && pendingCount && pendingCount > 0
              ? pendingCount
              : null

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-light text-primary font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge !== null && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-primary-foreground">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  )
}
