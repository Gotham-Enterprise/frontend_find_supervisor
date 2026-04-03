'use client'

import { useQuery } from '@tanstack/react-query'

import {
  buildSupervisorSearchParams,
  fetchSupervisorSearch,
  type SupervisorSearchQueryInput,
} from '@/lib/api/supervisor-search'

export const supervisorSearchKeys = {
  all: ['supervisor-search'] as const,
  query: (input: SupervisorSearchQueryInput) => [...supervisorSearchKeys.all, input] as const,
}

export function useSupervisorSearch(input: SupervisorSearchQueryInput) {
  return useQuery({
    queryKey: supervisorSearchKeys.query(input),
    queryFn: () => fetchSupervisorSearch(buildSupervisorSearchParams(input)),
  })
}
