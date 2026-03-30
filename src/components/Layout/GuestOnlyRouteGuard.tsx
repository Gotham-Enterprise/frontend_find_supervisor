'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getMe } from '@/lib/api/auth'
import { TOKEN_KEY } from '@/lib/api/client'
import { getDashboardPathForRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'

interface GuestOnlyRouteGuardProps {
  children: React.ReactNode
}

/**
 * Guest-only entry pages (login, signup): if a session exists, send the user to their dashboard.
 * Does not run on public marketing pages — only wrap routes that should be hidden once authenticated.
 *
 * Uses the same session probe as {@link ShellLayout}: `TOKEN_KEY` + `getMe()` (cookie-backed API).
 */
export function GuestOnlyRouteGuard({ children }: GuestOnlyRouteGuardProps) {
  const router = useRouter()
  const { user, setUser, setIsLoading: setContextLoading } = useUser()
  /**
   * Must start `false` on server and client so the first paint matches (avoids hydration errors).
   * Do not read `localStorage` in the initializer — that diverges SSR from the browser.
   * `useEffect` unlocks the guest UI or redirects once the session is known.
   */
  const [allowGuest, setAllowGuest] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

      if (!token) {
        if (!cancelled) setAllowGuest(true)
        return
      }

      if (user) {
        if (!cancelled) router.replace(getDashboardPathForRole(user.role))
        return
      }

      if (!cancelled) setContextLoading(true)
      try {
        const u = await getMe()
        if (cancelled) return
        setUser(u)
        router.replace(getDashboardPathForRole(u.role))
      } catch {
        if (cancelled) return
        localStorage.removeItem(TOKEN_KEY)
        setAllowGuest(true)
      } finally {
        if (!cancelled) setContextLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router, setUser, setContextLoading, user])

  if (!allowGuest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-hero-bg px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#006D36] border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return <>{children}</>
}
