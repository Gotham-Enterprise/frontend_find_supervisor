'use client'

import { GitPullRequestArrow, LayoutDashboard, LogOut, UserCheck, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { TOKEN_KEY } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Supervisors', href: '/supervisors', icon: Users },
  { label: 'Supervisees', href: '/supervisees', icon: UserCheck },
  { label: 'Matching Requests', href: '/matching', icon: GitPullRequestArrow },
]

export function Sidebar() {
  const pathname = usePathname()

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
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
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
              {label}
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
