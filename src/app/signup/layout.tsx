'use client'

import { GuestOnlyRouteGuard } from '@/components/Layout/GuestOnlyRouteGuard'

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <GuestOnlyRouteGuard>{children}</GuestOnlyRouteGuard>
}
