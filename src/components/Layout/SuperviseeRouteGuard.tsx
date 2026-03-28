'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'

interface SuperviseeRouteGuardProps {
  children: React.ReactNode
}

/**
 * Renders children only for authenticated supervisees; others are sent to the dashboard.
 * Use inside the authenticated shell on routes that are supervisee-only.
 */
export function SuperviseeRouteGuard({ children }: SuperviseeRouteGuardProps) {
  const router = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    if (!isSuperviseeRole(user.role)) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  if (!isSuperviseeRole(user.role)) {
    return null
  }

  return <>{children}</>
}
