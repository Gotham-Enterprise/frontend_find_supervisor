'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPayoutDashboardLink,
  createPayoutOnboardingLink,
  getHirePayment,
  getHourlyQuote,
  getPayoutStatus,
  saveHirePaymentMethod,
} from '@/lib/api/supervision'

import { hireKeys } from './useHires'

export const payoutKeys = {
  all: ['supervision', 'payouts'] as const,
  /** GET /supervision/payments/connect/status */
  status: () => [...payoutKeys.all, 'status'] as const,
  /** GET /supervision/payments/quote */
  quote: (hourlyRateCents: number, weeklyCapMinutes: number) =>
    [...payoutKeys.all, 'quote', hourlyRateCents, weeklyCapMinutes] as const,
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

/** Weekly prepay/payout breakdown for prospective hourly terms (dollars, hours). */
export function useHourlyQuote(
  hourlyRate: number | null | undefined,
  maxHoursPerWeek: number | null | undefined,
  enabled: boolean,
) {
  const rateCents = hourlyRate != null && hourlyRate >= 1 ? Math.round(hourlyRate * 100) : 0
  // Only whole 15-minute steps, matching the backend validation.
  const capMinutes =
    maxHoursPerWeek != null && Number.isInteger(maxHoursPerWeek * 4) && maxHoursPerWeek > 0
      ? Math.round(maxHoursPerWeek * 60)
      : 0
  return useQuery({
    queryKey: payoutKeys.quote(rateCents, capMinutes),
    queryFn: () => getHourlyQuote(rateCents / 100, capMinutes / 60),
    enabled: enabled && rateCents > 0 && capMinutes > 0 && capMinutes <= 40 * 60,
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

export function useSaveHirePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hireId, paymentMethodId }: { hireId: string; paymentMethodId: string }) =>
      saveHirePaymentMethod(hireId, paymentMethodId),
    onSuccess: (data, { hireId }) => {
      queryClient.setQueryData(payoutKeys.hirePayment(hireId), data)
    },
    // A card added through the SetupIntent is on the customer even when saving
    // it to the hire fails, so refresh the saved-card list for the retry.
    onError: async (_error, { hireId }) => {
      await queryClient.invalidateQueries({ queryKey: payoutKeys.hirePayment(hireId) })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: hireKeys.all })
    },
  })
}
