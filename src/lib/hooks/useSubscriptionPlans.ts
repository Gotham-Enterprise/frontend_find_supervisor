'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cancelSubscription,
  getCurrentSubscription,
  getSubscriptionPlans,
} from '@/lib/api/supervision'
import type { Subscription, SubscriptionPlan } from '@/types/supervisor-profile'

export const subscriptionKeys = {
  all: ['supervision', 'subscription'] as const,
  /** GET /supervision/plans */
  list: () => [...subscriptionKeys.all, 'plans'] as const,
  /** GET /supervision/payments/current-subscription */
  current: () => [...subscriptionKeys.all, 'current'] as const,
}

const STALE_MS = 60_000

/**
 * GET /supervision/plans — use while the plan modal is open (or whenever you need the list).
 * Populates {@link subscriptionKeys.list} for checkout and other consumers.
 */
export function useSubscriptionPlansQuery(enabled: boolean) {
  return useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: getSubscriptionPlans,
    enabled,
    staleTime: STALE_MS,
  })
}

export function useCurrentSubscriptionQuery(enabled: boolean) {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: getCurrentSubscription,
    enabled,
    staleTime: STALE_MS,
  })
}

/**
 * Fetches GET /supervision/plans on demand (e.g. imperative prefetch).
 * On success, writes the result into the query cache under {@link subscriptionKeys.list}.
 */
export function useSubscriptionPlansMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: getSubscriptionPlans,
    onSuccess: (data: SubscriptionPlan[]) => {
      queryClient.setQueryData(subscriptionKeys.list(), data)
    },
  })
}

/**
 * POST /supervision/payments/cancel-subscription
 *
 * On success, updates the cached current-subscription entry so the UI reflects
 * the cancellation immediately without a separate refetch round-trip.
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (updated: Subscription) => {
      queryClient.setQueryData(subscriptionKeys.current(), updated)
    },
  })
}
