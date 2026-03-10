'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { TOKEN_KEY } from '@/lib/api/client'

import { Sidebar } from './sidebar'

interface ShellLayoutProps {
  children: React.ReactNode
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isAuthenticated = Boolean(localStorage.getItem(TOKEN_KEY))
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [pathname, router])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
