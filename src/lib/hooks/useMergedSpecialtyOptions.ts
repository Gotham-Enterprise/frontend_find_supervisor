'use client'

import { useQueries } from '@tanstack/react-query'

import type { SelectOption } from '@/lib/api/options'
import { fetchSpecialtiesByOccupation } from '@/lib/api/options'

const STALE_TIME = 10 * 60 * 1000

/**
 * Merges specialty options from GET /api/categories/specialties/occupation/:id for each selected occupation.
 */
export function useMergedSpecialtyOptions(occupationIds: string[]) {
  const queries = useQueries({
    queries: occupationIds.map((id) => ({
      queryKey: ['signup-options', 'specialty', id],
      queryFn: () => fetchSpecialtiesByOccupation(id),
      enabled: Boolean(id),
      staleTime: STALE_TIME,
    })),
  })

  const map = new Map<string, SelectOption>()
  for (const q of queries) {
    for (const opt of q.data ?? []) {
      if (!map.has(opt.value)) map.set(opt.value, opt)
    }
  }
  const options = [...map.values()]
  const isLoading = queries.some((q) => q.isLoading)

  return { options, isLoading }
}
