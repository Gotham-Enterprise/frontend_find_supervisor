'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupervisionSettings } from '@/lib/api/supervision-settings'
import { useUser } from '@/lib/contexts/UserContext'

export const supervisionSettingsKeys = {
  all: ['supervision-settings'] as const,
  current: () => [...supervisionSettingsKeys.all, 'current'] as const,
}

export function useSupervisionSettings() {
  const { user } = useUser()
  const userId = user?.id

  return useQuery({
    queryKey: supervisionSettingsKeys.current(),
    queryFn: getSupervisionSettings,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}
