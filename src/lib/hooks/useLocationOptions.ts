import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { fetchCitiesApi, fetchStatesApi, type SelectOption } from '@/lib/api/locations'

const STALE_TIME = 2 * 60 * 60 * 1000 // 2 hours

export function useStatesOptions() {
  return useQuery<SelectOption[]>({
    queryKey: ['location', 'states'],
    queryFn: fetchStatesApi,
    staleTime: STALE_TIME,
  })
}

export function useCitiesOptions(stateCode: string) {
  return useQuery<SelectOption[]>({
    queryKey: ['location', 'cities', stateCode],
    queryFn: () => fetchCitiesApi(stateCode),
    enabled: !!stateCode?.trim(),
    staleTime: STALE_TIME,
  })
}

/**
 * Loads cities for multiple state codes in parallel and returns a merged,
 * alphabetically-sorted, deduplicated list of city options.
 *
 * Returns { data, isLoading, isError } — mirrors the single-state hook shape.
 */
export function useMultiStateCityOptions(stateCodes: string[]) {
  const results = useQueries({
    queries: stateCodes.map((code) => ({
      queryKey: ['location', 'cities', code] as const,
      queryFn: () => fetchCitiesApi(code),
      enabled: !!code?.trim(),
      staleTime: STALE_TIME,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const data = useMemo<SelectOption[]>(() => {
    if (stateCodes.length === 0) return []
    const seen = new Set<string>()
    return results
      .flatMap((r) => r.data ?? [])
      .filter((opt) => {
        if (seen.has(opt.value)) return false
        seen.add(opt.value)
        return true
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [results, stateCodes.length])

  return { data, isLoading, isError }
}
