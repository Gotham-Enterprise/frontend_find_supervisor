'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveBillingWeek,
  deleteHireSession,
  disputeBillingWeek,
  getHireBillingWeeks,
  getSupervisorEarnings,
  getSupervisorWeekSummary,
  logHireSession,
  payNowBillingWeek,
  requestLateEntry,
  respondToLateSession,
  syncPayNowBillingWeek,
  updateHireSession,
} from '@/lib/api/supervision'
import { stripePromise } from '@/lib/stripe/client'
import type { HireBillingWeeks, HireSessionInput } from '@/types/sessions'

export const hireSessionKeys = {
  all: ['supervision', 'hire-sessions'] as const,
  /** GET /supervision/hires/:hireId/billing-weeks */
  weeks: (hireId: string) => [...hireSessionKeys.all, hireId] as const,
}

export function useSupervisorEarnings(
  page: number,
  enabled: boolean,
  hireId: string | null = null,
) {
  return useQuery({
    queryKey: [...hireSessionKeys.all, 'earnings', page, hireId] as const,
    queryFn: () => getSupervisorEarnings(page, 10, hireId),
    enabled,
    placeholderData: (previous) => previous,
  })
}

/** One week of earnings across hires; `start` is any date in that week (null = current). */
export function useSupervisorWeekSummary(start: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [...hireSessionKeys.all, 'earnings', 'week', start] as const,
    queryFn: () => getSupervisorWeekSummary(start),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useHireBillingWeeks(hireId: string, enabled: boolean) {
  return useQuery({
    queryKey: hireSessionKeys.weeks(hireId),
    queryFn: () => getHireBillingWeeks(hireId),
    enabled,
    staleTime: 0,
  })
}

/** Every session/review mutation returns the hire's refreshed billing weeks. */
function useBillingWeeksMutation<TVariables>(
  hireId: string,
  mutationFn: (variables: TVariables) => Promise<HireBillingWeeks>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (data) => queryClient.setQueryData(hireSessionKeys.weeks(hireId), data),
    // A rejected change (e.g. the week just closed) means the cached state is stale.
    onError: () => queryClient.invalidateQueries({ queryKey: hireSessionKeys.weeks(hireId) }),
  })
}

/** Sends a late-entry request to support; it's listed under the week until support adds it. */
export function useRequestLateEntry(hireId: string) {
  return useBillingWeeksMutation(hireId, (input: HireSessionInput) =>
    requestLateEntry(hireId, input),
  )
}

export function useLogHireSession(hireId: string) {
  return useBillingWeeksMutation(hireId, (input: HireSessionInput) => logHireSession(hireId, input))
}

export function useUpdateHireSession(hireId: string) {
  return useBillingWeeksMutation(
    hireId,
    ({ sessionId, input }: { sessionId: string; input: HireSessionInput }) =>
      updateHireSession(hireId, sessionId, input),
  )
}

export function useDeleteHireSession(hireId: string) {
  return useBillingWeeksMutation(hireId, (sessionId: string) =>
    deleteHireSession(hireId, sessionId),
  )
}

export function useRespondToLateSession(hireId: string) {
  return useBillingWeeksMutation(
    hireId,
    ({ sessionId, approve }: { sessionId: string; approve: boolean }) =>
      respondToLateSession(hireId, sessionId, approve),
  )
}

export function useApproveBillingWeek(hireId: string) {
  return useBillingWeeksMutation(hireId, (weekId: string) => approveBillingWeek(hireId, weekId))
}

export function useDisputeBillingWeek(hireId: string) {
  return useBillingWeeksMutation(
    hireId,
    ({ weekId, reason, attachments }: { weekId: string; reason: string; attachments?: File[] }) =>
      disputeBillingWeek(hireId, weekId, reason, attachments),
  )
}

/** A card error from Stripe.js (its message is safe to show as-is). */
export class CardPaymentError extends Error {}

/**
 * Pays an unpaid week now with the saved card: the backend prepares the
 * PaymentIntent, Stripe.js confirms it here (so 3-D Secure can prompt), and
 * the backend re-reads the result.
 */
export function usePayNowBillingWeek(hireId: string) {
  return useBillingWeeksMutation(hireId, async (weekId: string) => {
    const intent = await payNowBillingWeek(hireId, weekId)
    if (intent.status !== 'succeeded' && intent.clientSecret) {
      const stripe = await stripePromise
      if (!stripe) throw new CardPaymentError('Card payments are not configured.')
      const result = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: intent.paymentMethodId,
      })
      if (result.error) {
        // Record the failure on the week, then show Stripe's message.
        await syncPayNowBillingWeek(hireId, weekId).catch(() => undefined)
        throw new CardPaymentError(result.error.message ?? 'Your card was declined.')
      }
    }
    return syncPayNowBillingWeek(hireId, weekId)
  })
}
