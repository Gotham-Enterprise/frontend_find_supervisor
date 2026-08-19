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
 * Reads the `?redirect=` query param and returns it if it is a safe internal path.
 * Falls back to the role-based dashboard path.
 */
function resolvePostLoginPath(role: string): string {
  if (typeof window === 'undefined') return getDashboardPathForRole(role)
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')
  const isSafe = redirect && redirect.startsWith('/') && !redirect.startsWith('//')
  return isSafe ? redirect : getDashboardPathForRole(role)
}

/**
 * Guest-only entry pages (login, signup): if a session exists, send the user to their dashboard
 * (or the `?redirect=` destination if present and safe).
 * Does not run on public marketing pages — only wrap routes that should be hidden once authenticated.
 *
 * Uses the same session probe as {@link ShellLayout}: `TOKEN_KEY` + `getMe()` (cookie-backed API).
 */
export function GuestOnlyRouteGuard({ children }: GuestOnlyRouteGuardProps) {
  const router = useRouter()
  const { user, setUser, setIsLoading: setContextLoading } = useUser()
  /**
   * Guest content renders IMMEDIATELY (server and first client paint match, and
   * crawlers get real HTML for the landing page — the previous blank-until-checked
   * behavior served an empty shell to SEO). The spinner only takes over once a
   * session token is actually found in localStorage, while we probe and redirect.
   */
  const [checkingSession, setCheckingSession] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

      // No token — guest content is already visible; nothing to do.
      if (!token) return

      if (user) {
        if (!cancelled) {
          setCheckingSession(true)
          router.replace(resolvePostLoginPath(user.role))
        }
        return
      }

      if (!cancelled) {
        setCheckingSession(true)
        setContextLoading(true)
      }
      try {
        const u = await getMe()
        if (cancelled) return
        setUser(u)
        router.replace(resolvePostLoginPath(u.role))
      } catch {
        if (cancelled) return
        localStorage.removeItem(TOKEN_KEY)
        setCheckingSession(false)
      } finally {
        if (!cancelled) setContextLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router, setUser, setContextLoading, user])

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-hero-bg px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#006D36] border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return <>{children}</>
}
