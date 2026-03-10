'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupervisorById } from '@/lib/api/supervisors'

export const supervisorDetailKeys = {
  all: ['supervisor-detail'] as const,
  detail: (id: string) => [...supervisorDetailKeys.all, id] as const,
}

export function useSupervisor(id: string) {
  return useQuery({
    queryKey: supervisorDetailKeys.detail(id),
    queryFn: () => getSupervisorById(id),
    enabled: !!id,
  })
}
