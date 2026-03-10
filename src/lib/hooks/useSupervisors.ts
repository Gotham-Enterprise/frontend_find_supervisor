'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupervisors, type GetSupervisorsParams } from '@/lib/api/supervisors'

export const supervisorKeys = {
  all: ['supervisors'] as const,
  list: (params?: GetSupervisorsParams) => [...supervisorKeys.all, 'list', params] as const,
}

export function useSupervisors(params?: GetSupervisorsParams) {
  return useQuery({
    queryKey: supervisorKeys.list(params),
    queryFn: () => getSupervisors(params),
  })
}
