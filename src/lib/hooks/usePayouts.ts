'use client'

import { useMutation, useQuery } from '@tanstack/react-query'

import {
  createPayoutDashboardLink,
  createPayoutOnboardingLink,
  getPayoutStatus,
} from '@/lib/api/supervision'

export const payoutKeys = {
  all: ['supervision', 'payouts'] as const,
  /** GET /supervision/payments/connect/status */
  status: () => [...payoutKeys.all, 'status'] as const,
}

export function usePayoutStatusQuery(enabled: boolean) {
  return useQuery({
    queryKey: payoutKeys.status(),
    queryFn: getPayoutStatus,
    enabled,
    // Status changes on Stripe's side; always re-read when the page is revisited.
    staleTime: 0,
  })
}

/** Sends the supervisor to Stripe-hosted onboarding (same tab). */
export function useStartPayoutOnboarding() {
  return useMutation({
    mutationFn: createPayoutOnboardingLink,
    onSuccess: ({ url }) => {
      window.location.assign(url)
    },
  })
}

/** Creates a Stripe Express dashboard login link (single use). */
export function useCreatePayoutDashboardLink() {
  return useMutation({ mutationFn: createPayoutDashboardLink })
}
