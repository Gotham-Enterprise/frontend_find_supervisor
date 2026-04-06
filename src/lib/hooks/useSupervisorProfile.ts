'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupervisorProfileById } from '@/lib/api/supervisor-profile'
import { useUser } from '@/lib/contexts/UserContext'

export const supervisorProfileKeys = {
  detail: (userId: string) => ['supervisor-profile', userId] as const,
}

/**
 * Fetches the authenticated supervisor's own profile via `?id=` using `useUser().id`.
 */
export function useSupervisorProfile(enabled = true) {
  const { user } = useUser()
  const userId = user?.id

  return useQuery({
    queryKey: userId
      ? supervisorProfileKeys.detail(userId)
      : (['supervisor-profile-disabled'] as const),
    queryFn: () => getSupervisorProfileById(userId!),
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 5,
  })
}
