'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createMatchingRequest,
  getMatchingRequests,
  type GetMatchingRequestsParams,
  updateMatchingRequestStatus,
} from '@/lib/api/matching'
import type { CreateMatchingRequestDto } from '@/types'

export const matchingKeys = {
  all: ['matching-requests'] as const,
  list: (params?: GetMatchingRequestsParams) => [...matchingKeys.all, 'list', params] as const,
}

export function useMatchingRequests(params?: GetMatchingRequestsParams) {
  return useQuery({
    queryKey: matchingKeys.list(params),
    queryFn: () => getMatchingRequests(params),
  })
}

export function useCreateMatchingRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateMatchingRequestDto) => createMatchingRequest(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: matchingKeys.all })
    },
  })
}

export function useUpdateMatchingRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'rejected' | 'cancelled' }) =>
      updateMatchingRequestStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: matchingKeys.all })
    },
  })
}
