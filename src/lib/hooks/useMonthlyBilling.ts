'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveMonthlyPeriod,
  disputeMonthlyPeriod,
  getHireMonthlyBilling,
  getMonthlyQuote,
  getMyMonthlyPayments,
  payNowMonthlyPeriod,
  saveMonthlyCard,
  syncPayNowMonthlyPeriod,
} from '@/lib/api/monthly-billing'
import { stripePromise } from '@/lib/stripe/client'
import type { HireMonthlyBilling } from '@/types/monthly-billing'

import { hireKeys } from './useHires'
import { CardPaymentError } from './useHireSessions'
import { payoutKeys } from './usePayouts'

export const monthlyBillingKeys = {
  all: ['supervision', 'monthly-billing'] as const,
  /** GET /supervision/payments/monthly-quote */
  quote: (amountCents: number) => [...monthlyBillingKeys.all, 'quote', amountCents] as const,
  /** GET /supervision/hires/:hireId/monthly-billing */
  hire: (hireId: string) => [...monthlyBillingKeys.all, 'hire', hireId] as const,
  /** GET /supervision/payments/monthly */
  mine: (page: number) => [...monthlyBillingKeys.all, 'mine', page] as const,
}

/** One month's charge and payout for a prospective monthly amount (dollars). */
export function useMonthlyQuote(monthlyAmount: number | null | undefined, enabled: boolean) {
  const amountCents =
    monthlyAmount != null && monthlyAmount >= 1 && monthlyAmount <= 100000
      ? Math.round(monthlyAmount * 100)
      : 0
  return useQuery({
    queryKey: monthlyBillingKeys.quote(amountCents),
    queryFn: () => getMonthlyQuote(amountCents / 100),
    enabled: enabled && amountCents > 0,
    staleTime: Infinity,
  })
}

export function useHireMonthlyBilling(hireId: string, enabled = true) {
  return useQuery({
    queryKey: monthlyBillingKeys.hire(hireId),
    queryFn: () => getHireMonthlyBilling(hireId),
    enabled,
    staleTime: 30 * 1000,
  })
}

export function useMyMonthlyPayments(page: number, enabled = true) {
  return useQuery({
    queryKey: monthlyBillingKeys.mine(page),
    queryFn: () => getMyMonthlyPayments(page, 10),
    enabled,
    staleTime: 60 * 1000,
  })
}

/**
 * Mutations return the hire's fresh billing; the hire list (status, card,
 * scheduled end) and the Billing page lists are refetched too.
 */
function useMonthlyBillingMutation<TVariables>(
  hireId: string,
  mutationFn: (variables: TVariables) => Promise<HireMonthlyBilling>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.setQueryData(monthlyBillingKeys.hire(hireId), data)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: monthlyBillingKeys.all }),
        queryClient.invalidateQueries({ queryKey: hireKeys.all }),
        queryClient.invalidateQueries({ queryKey: payoutKeys.superviseeCards() }),
      ])
    },
  })
}

export function useSaveMonthlyCard(hireId: string) {
  return useMonthlyBillingMutation(hireId, (paymentMethodId: string) =>
    saveMonthlyCard(hireId, paymentMethodId),
  )
}

export function useApproveMonthlyPeriod(hireId: string) {
  return useMonthlyBillingMutation(hireId, (periodId: string) =>
    approveMonthlyPeriod(hireId, periodId),
  )
}

export function useDisputeMonthlyPeriod(hireId: string) {
  return useMonthlyBillingMutation(
    hireId,
    ({ periodId, reason }: { periodId: string; reason: string }) =>
      disputeMonthlyPeriod(hireId, periodId, reason),
  )
}

/**
 * Pays an unpaid month with the hire's card: the backend prepares the
 * PaymentIntent, Stripe.js confirms it here (so 3-D Secure can prompt), and
 * the backend re-reads the result.
 */
export function usePayNowMonthlyPeriod(hireId: string) {
  return useMonthlyBillingMutation(hireId, async (periodId: string) => {
    const intent = await payNowMonthlyPeriod(hireId, periodId)
    if (intent.status !== 'succeeded' && intent.clientSecret) {
      const stripe = await stripePromise
      if (!stripe) throw new CardPaymentError('Card payments are not configured.')
      const result = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: intent.paymentMethodId,
      })
      if (result.error) {
        await syncPayNowMonthlyPeriod(hireId, periodId).catch(() => undefined)
        throw new CardPaymentError(result.error.message ?? 'Your card was declined.')
      }
    }
    return syncPayNowMonthlyPeriod(hireId, periodId)
  })
}
