'use client'

import { useRequireAuth } from '@/lib/hooks/useRequireAuth'

import { Sidebar } from './sidebar'

interface ShellLayoutProps {
  children: React.ReactNode
}

export function ShellLayout({ children }: ShellLayoutProps) {
  useRequireAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
