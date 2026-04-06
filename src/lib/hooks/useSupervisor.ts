'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupervisorProfileById } from '@/lib/api/supervisor-profile'

export const supervisorDetailKeys = {
  all: ['supervisor-detail'] as const,
  detail: (id: string) => [...supervisorDetailKeys.all, id] as const,
}

export function useSupervisor(id: string) {
  return useQuery({
    queryKey: supervisorDetailKeys.detail(id),
    queryFn: () => getSupervisorProfileById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
