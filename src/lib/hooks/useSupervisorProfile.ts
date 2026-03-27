'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupervisorProfile } from '@/lib/api/supervisor-profile'

export const supervisorProfileKeys = {
  all: ['supervisor-profile'] as const,
}

export function useSupervisorProfile(enabled = true) {
  return useQuery({
    queryKey: supervisorProfileKeys.all,
    queryFn: getSupervisorProfile,
    enabled,
    staleTime: 1000 * 60 * 5,
  })
}
