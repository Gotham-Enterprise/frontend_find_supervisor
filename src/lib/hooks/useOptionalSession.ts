'use client'

import { useEffect, useState } from 'react'

import { getMe } from '@/lib/api/auth'
import { TOKEN_KEY } from '@/lib/api/client'
import { useUser } from '@/lib/contexts/UserContext'

export type OptionalSessionStatus = 'loading' | 'authenticated' | 'guest'

/**
 * Resolves whether a session exists without redirecting.
 * Used for pages that are public for guests but should use the app shell when signed in.
 */
export function useOptionalSession(): OptionalSessionStatus {
  const { user, setUser, setIsLoading } = useUser()
  const [status, setStatus] = useState<OptionalSessionStatus>(() =>
    user ? 'authenticated' : 'loading',
  )

  useEffect(() => {
    if (user) {
      setStatus('authenticated')
      return
    }

    let cancelled = false

    async function resolve() {
      const token = localStorage.getItem(TOKEN_KEY)

      if (!token) {
        if (!cancelled) setStatus('guest')
        return
      }

      setIsLoading(true)
      try {
        const nextUser = await getMe()
        if (cancelled) return
        setUser(nextUser)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        localStorage.removeItem(TOKEN_KEY)
        setStatus('guest')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void resolve()

    return () => {
      cancelled = true
    }
  }, [user, setUser, setIsLoading])

  return status
}
