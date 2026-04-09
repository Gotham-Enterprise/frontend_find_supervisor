'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { isSupervisorRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'

interface SupervisorRouteGuardProps {
  children: React.ReactNode
}

/**
 * Renders children only for authenticated supervisors; others are redirected to the dashboard.
 * Use inside the authenticated shell on routes that are supervisor-only.
 */
export function SupervisorRouteGuard({ children }: SupervisorRouteGuardProps) {
  const router = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    if (!isSupervisorRole(user.role)) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  if (!isSupervisorRole(user.role)) {
    return null
  }

  return <>{children}</>
}
