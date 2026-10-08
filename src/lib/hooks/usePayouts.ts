'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPayoutDashboardLink,
  createPayoutOnboardingLink,
  getHirePayment,
  getPayoutStatus,
  getWeeklyQuote,
  startHirePayment,
} from '@/lib/api/supervision'

import { hireKeys } from './useHires'

export const payoutKeys = {
  all: ['supervision', 'payouts'] as const,
  /** GET /supervision/payments/connect/status */
  status: () => [...payoutKeys.all, 'status'] as const,
  /** GET /supervision/payments/quote */
  quote: (weeklyAmountCents: number) => [...payoutKeys.all, 'quote', weeklyAmountCents] as const,
  /** GET /supervision/hires/:hireId/payment */
  hirePayment: (hireId: string) => [...payoutKeys.all, 'hire', hireId] as const,
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

/** Weekly charge breakdown for a prospective weekly rate in dollars (agreement form preview). */
export function useWeeklyQuote(weeklyAmount: number | null | undefined, enabled: boolean) {
  const cents = weeklyAmount != null && weeklyAmount >= 1 ? Math.round(weeklyAmount * 100) : 0
  return useQuery({
    queryKey: payoutKeys.quote(cents),
    queryFn: () => getWeeklyQuote(cents / 100),
    enabled: enabled && cents > 0,
    staleTime: Infinity,
    placeholderData: (previous) => previous,
  })
}

export function useHirePayment(hireId: string, enabled: boolean) {
  return useQuery({
    queryKey: payoutKeys.hirePayment(hireId),
    queryFn: () => getHirePayment(hireId),
    enabled,
    staleTime: 0,
  })
}

export function useStartHirePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hireId, paymentMethodId }: { hireId: string; paymentMethodId: string }) =>
      startHirePayment(hireId, paymentMethodId),
    onSuccess: (data, { hireId }) => {
      queryClient.setQueryData(payoutKeys.hirePayment(hireId), data)
    },
    // A new card is saved to the customer even when its first charge fails, so
    // refresh the saved-card list for the retry.
    onError: async (_error, { hireId }) => {
      await queryClient.invalidateQueries({ queryKey: payoutKeys.hirePayment(hireId) })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: hireKeys.all })
    },
  })
}
