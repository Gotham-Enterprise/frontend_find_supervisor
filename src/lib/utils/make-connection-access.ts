import { isSupervisorRole } from '@/lib/auth/roles'
import { hasActiveSupervisorSubscription } from '@/lib/utils/subscription-status'
import type { User } from '@/types'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

export type MakeConnectionAccessDeniedReason =
  | 'loading'
  | 'logged_out'
  | 'not_supervisor'
  | 'no_subscription'

export type MakeConnectionAccess =
  | { allowed: true }
  | { allowed: false; reason: MakeConnectionAccessDeniedReason }

export function getMakeConnectionAccess({
  user,
  supervisorProfile,
  profileLoading,
}: {
  user: User | null
  supervisorProfile: SupervisorProfileData | null | undefined
  profileLoading: boolean
}): MakeConnectionAccess {
  if (profileLoading) {
    return { allowed: false, reason: 'loading' }
  }

  if (!user) {
    return { allowed: false, reason: 'logged_out' }
  }

  if (!isSupervisorRole(user.role)) {
    return { allowed: false, reason: 'not_supervisor' }
  }

  if (!supervisorProfile || !hasActiveSupervisorSubscription(supervisorProfile)) {
    return { allowed: false, reason: 'no_subscription' }
  }

  return { allowed: true }
}
