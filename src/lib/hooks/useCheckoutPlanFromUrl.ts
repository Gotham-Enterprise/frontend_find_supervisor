'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import { getSubscriptionPlans } from '@/lib/api/supervision'
import { canCheckoutPlan } from '@/lib/constants/subscription-plans'
import type { SubscriptionPlan } from '@/types/supervisor-profile'

import { subscriptionKeys } from './useSubscriptionPlans'

/**
 * Resolves the subscription plan selected on checkout via `?planId=` using the
 * React Query cache (populated by the plan modal) or a fresh GET /supervision/plans.
 *
 * `canCheckout` is false for free plans (priceInCents === 0 or no stripePriceId) so
 * the checkout page can show an appropriate message instead of calling Stripe.
 */
export function useCheckoutPlanFromUrl() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')

  const query = useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: getSubscriptionPlans,
  })

  const plan: SubscriptionPlan | undefined =
    planId && query.data ? query.data.find((p) => p.id === planId) : undefined

  return {
    planId,
    plan,
    /** False for free plans that must not go through Stripe checkout. */
    canCheckout: plan ? canCheckoutPlan(plan) : true, // true while loading to avoid flash
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
