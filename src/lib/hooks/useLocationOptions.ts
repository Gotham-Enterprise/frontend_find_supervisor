import { useQuery } from '@tanstack/react-query'

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
