'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getMe } from '@/lib/api/auth'
import { TOKEN_KEY } from '@/lib/api/client'
import { useUser } from '@/lib/contexts/UserContext'

import { Sidebar } from './sidebar'

interface ShellLayoutProps {
  children: React.ReactNode
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, setIsLoading } = useUser()

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    // Token exists but user hasn't been hydrated yet (e.g. after a page refresh)
    if (!user) {
      setIsLoading(true)
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        })
        .finally(() => setIsLoading(false))
    }
  }, [pathname, router, user, setUser, setIsLoading])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
