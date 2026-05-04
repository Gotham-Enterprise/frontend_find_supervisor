'use client'

import { isSuperviseeRole, isSupervisorRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'

import { SuperviseeMyProfileSection } from './SuperviseeMyProfileSection'
import { SupervisorMyProfileSection } from './SupervisorMyProfileSection'

export function MyProfilePage() {
  const { user, isLoading } = useUser()

  if (isLoading) return null

  if (isSupervisorRole(user?.role)) {
    return <SupervisorMyProfileSection />
  }
  if (isSuperviseeRole(user?.role)) {
    return <SuperviseeMyProfileSection />
  }

  return <p className="text-sm text-muted-foreground">Select a role to see your profile.</p>
}
