'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getMe } from '@/lib/api/auth'
import { TOKEN_KEY } from '@/lib/api/client'
import { useUser } from '@/lib/contexts/UserContext'

/**
 * Redirects unauthenticated users to login; hydrates user from token when needed.
 * Used by shell layouts that require a logged-in session.
 */
export function useRequireAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, setIsLoading } = useUser()

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

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
}
