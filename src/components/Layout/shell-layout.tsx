'use client'

import { useRequireAuth } from '@/lib/hooks/useRequireAuth'

import { AppShellChrome } from './app-shell-chrome'

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

  return <AppShellChrome>{children}</AppShellChrome>
}
