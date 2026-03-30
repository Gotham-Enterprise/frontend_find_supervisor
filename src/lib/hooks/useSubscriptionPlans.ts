'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getSubscriptionPlans } from '@/lib/api/supervision'
import type { SubscriptionPlan } from '@/types/supervisor-profile'

export const subscriptionKeys = {
  all: ['supervision', 'subscription-plans'] as const,
  list: () => [...subscriptionKeys.all, 'list'] as const,
}

/**
 * Fetches GET /supervision/plans on demand (e.g. before navigating to checkout).
 * On success, writes the result into the query cache under {@link subscriptionKeys.list}
 * so checkout can read it with `useQuery` later.
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
