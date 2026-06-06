'use client'

import { useQuery } from '@tanstack/react-query'

import {
  buildSuperviseeSearchParams,
  fetchSuperviseeSearch,
  type SuperviseeSearchQueryInput,
} from '@/lib/api/supervisee-search'

export const superviseeSearchKeys = {
  all: ['supervisee-search'] as const,
  query: (input: SuperviseeSearchQueryInput) => [...superviseeSearchKeys.all, input] as const,
}

export function useSuperviseeSearch(input: SuperviseeSearchQueryInput, enabled = true) {
  return useQuery({
    queryKey: superviseeSearchKeys.query(input),
    queryFn: () => fetchSuperviseeSearch(buildSuperviseeSearchParams(input)),
    enabled,
  })
}
