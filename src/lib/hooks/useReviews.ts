'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createReview, getReviews, updateReview } from '@/lib/api/reviews'
import type { CreateReviewPayload, UpdateReviewPayload } from '@/types/review'

import { hireKeys } from './useHires'

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (params: Record<string, unknown>) => [...reviewKeys.all, 'list', params] as const,
  bySupervisor: (supervisorId: string, page: number, limit: number) =>
    [...reviewKeys.all, 'supervisor', supervisorId, page, limit] as const,
  mine: (limit: number) => [...reviewKeys.all, 'mine', limit] as const,
}

/** Fetches paginated reviews for a specific supervisor — used on the Supervisor Detail page. */
export function useSupervisorReviews(supervisorId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: reviewKeys.bySupervisor(supervisorId, page, limit),
    queryFn: () => getReviews({ supervisorId, page, limit }),
    enabled: !!supervisorId,
    staleTime: 2 * 60 * 1000,
  })
}

/** Fetches all reviews submitted by the authenticated supervisee.
 *  Pass limit=0 to retrieve all records (no pagination). */
export function useMyReviews(limit = 0) {
  return useQuery({
    queryKey: reviewKeys.mine(limit),
    queryFn: () => getReviews({ limit }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.all })
      await queryClient.invalidateQueries({ queryKey: hireKeys.all })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      updateReview(reviewId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.all })
      await queryClient.invalidateQueries({ queryKey: hireKeys.all })
    },
  })
}
