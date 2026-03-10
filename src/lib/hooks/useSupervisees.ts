'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupervisees, type GetSuperviseesParams } from '@/lib/api/supervisees'

export const superviseeKeys = {
  all: ['supervisees'] as const,
  list: (params?: GetSuperviseesParams) => [...superviseeKeys.all, 'list', params] as const,
}

export function useSupervisees(params?: GetSuperviseesParams) {
  return useQuery({
    queryKey: superviseeKeys.list(params),
    queryFn: () => getSupervisees(params),
  })
}
