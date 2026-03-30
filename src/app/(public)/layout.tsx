'use client'

import { usePathname } from 'next/navigation'

import { GuestOnlyRouteGuard } from '@/components/Layout/GuestOnlyRouteGuard'
import { PublicFooter } from '@/components/Layout/public-footer'
import { PublicHeader } from '@/components/Layout/public-header'
import { isGuestOnlyPath } from '@/lib/auth/guest-only-routes'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const shell = (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )

  if (isGuestOnlyPath(pathname)) {
    return <GuestOnlyRouteGuard>{shell}</GuestOnlyRouteGuard>
  }

  return shell
}
