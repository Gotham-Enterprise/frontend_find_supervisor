'use client'

import { usePathname } from 'next/navigation'

import { GuestOnlyRouteGuard } from '@/components/Layout/GuestOnlyRouteGuard'
import { isGuestOnlyPath } from '@/lib/auth/guest-only-routes'

/**
 * `/email-verification` must stay reachable with query tokens while authenticated (verify / resend flows).
 * Other guest-only auth routes (see `GUEST_ONLY_PATHS`) redirect when a session already exists.
 */
export default function AuthSegmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/email-verification')) {
    return children
  }

  if (isGuestOnlyPath(pathname)) {
    return <GuestOnlyRouteGuard>{children}</GuestOnlyRouteGuard>
  }

  return children
}
