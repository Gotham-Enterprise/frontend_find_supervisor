'use client'

import { useRequireAuth } from '@/lib/hooks/useRequireAuth'

import { DashboardTopbar } from './dashboard-topbar'
import { Sidebar } from './sidebar'

interface ShellLayoutProps {
  children: React.ReactNode
}

/**
 * Authenticated shell used by all dashboard-level pages.
 *
 * Layout (matches paper.design dashboards):
 *   ┌──────────┬───────────────────────────────┐
 *   │          │  Topbar (60px)                │
 *   │ Sidebar  ├───────────────────────────────┤
 *   │  240px   │  Scrollable page content      │
 *   │          │                               │
 *   └──────────┴───────────────────────────────┘
 */
export function ShellLayout({ children }: ShellLayoutProps) {
  useRequireAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />

      {/* Main column: topbar + scrollable content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto bg-background-subtle">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
