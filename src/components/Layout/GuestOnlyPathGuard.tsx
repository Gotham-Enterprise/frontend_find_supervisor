'use client'

import { usePathname } from 'next/navigation'

import { GuestOnlyRouteGuard } from '@/components/Layout/GuestOnlyRouteGuard'
import { isGuestOnlyPath } from '@/lib/auth/guest-only-routes'

/**
 * Applies the guest-only guard on matching paths only. Receives its subtree
 * via `children` from a server layout, so the public header/footer inside it
 * stay server components (the footer fetches top-states data server-side).
 */
export function GuestOnlyPathGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isGuestOnlyPath(pathname)) {
    return <GuestOnlyRouteGuard>{children}</GuestOnlyRouteGuard>
  }

  return <>{children}</>
}
