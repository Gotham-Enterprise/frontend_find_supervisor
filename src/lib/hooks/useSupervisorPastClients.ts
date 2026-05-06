'use client'

import { useQuery } from '@tanstack/react-query'

import { getPastClients } from '@/lib/api/supervision'

export const pastClientsKeys = {
  all: ['supervision', 'past-clients'] as const,
  list: (supervisorId: string, page: number, limit: number) =>
    [...pastClientsKeys.all, supervisorId, page, limit] as const,
}

export function useSupervisorPastClients(options: {
  supervisorId: string
  page?: number
  limit?: number
  enabled?: boolean
}) {
  const { supervisorId, page = 1, limit = 0, enabled = true } = options
  return useQuery({
    queryKey: pastClientsKeys.list(supervisorId, page, limit),
    queryFn: () => getPastClients({ supervisorId, page, limit }),
    enabled: enabled && Boolean(supervisorId),
    staleTime: 2 * 60 * 1000,
  })
}
