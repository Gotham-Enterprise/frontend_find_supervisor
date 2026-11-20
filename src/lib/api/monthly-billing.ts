import type { ApiResponse } from '@/types/api'
import type {
  HireMonthlyBilling,
  MonthlyDisputeCategory,
  MonthlyPaymentsPage,
  MonthlyQuote,
} from '@/types/monthly-billing'

import { apiClient } from './client'

/**
 * In-app monthly billing (Medical Director retainers). Kept apart from the
 * hourly billing endpoints in ./supervision.
 */

/** GET /supervision/payments/monthly-quote — one month's charge and payout for an amount in dollars. */
export async function getMonthlyQuote(monthlyAmount: number): Promise<MonthlyQuote> {
  const { data } = await apiClient.get<ApiResponse<MonthlyQuote>>(
    '/supervision/payments/monthly-quote',
    { params: { monthlyAmount } },
  )
  return data.data
}

/** GET /supervision/hires/:hireId/monthly-billing — terms, card and months of one hire. */
export async function getHireMonthlyBilling(hireId: string): Promise<HireMonthlyBilling> {
  const { data } = await apiClient.get<ApiResponse<HireMonthlyBilling>>(
    `/supervision/hires/${hireId}/monthly-billing`,
  )
  return data.data
}

/** POST …/monthly-billing/setup-intent — SetupIntent for saving a new card. */
export async function createMonthlySetupIntent(hireId: string): Promise<{ clientSecret: string }> {
  const { data } = await apiClient.post<ApiResponse<{ clientSecret: string }>>(
    `/supervision/hires/${hireId}/monthly-billing/setup-intent`,
  )
  return data.data
}

/** PUT …/monthly-billing/card — saves the card; a month that's already due is charged right away. */
export async function saveMonthlyCard(
  hireId: string,
  paymentMethodId: string,
): Promise<HireMonthlyBilling> {
  const { data } = await apiClient.put<ApiResponse<HireMonthlyBilling>>(
    `/supervision/hires/${hireId}/monthly-billing/card`,
    { paymentMethodId },
  )
  return data.data
}

export interface MonthlyPayNowIntent {
  status: string
  clientSecret?: string
  paymentMethodId?: string
}

/** POST …/periods/:periodId/pay-now — Stripe.js confirms the returned intent. */
export async function payNowMonthlyPeriod(
  hireId: string,
  periodId: string,
): Promise<MonthlyPayNowIntent> {
  const { data } = await apiClient.post<ApiResponse<MonthlyPayNowIntent>>(
    `/supervision/hires/${hireId}/monthly-billing/periods/${periodId}/pay-now`,
  )
  return data.data
}

/** POST …/pay-now/sync — refreshes the month after Stripe.js confirmed the payment. */
export async function syncPayNowMonthlyPeriod(
  hireId: string,
  periodId: string,
): Promise<HireMonthlyBilling> {
  const { data } = await apiClient.post<ApiResponse<HireMonthlyBilling>>(
    `/supervision/hires/${hireId}/monthly-billing/periods/${periodId}/pay-now/sync`,
  )
  return data.data
}

/** POST …/approve — releases an ended month to the Medical Director now. */
export async function approveMonthlyPeriod(
  hireId: string,
  periodId: string,
): Promise<HireMonthlyBilling> {
  const { data } = await apiClient.post<ApiResponse<HireMonthlyBilling>>(
    `/supervision/hires/${hireId}/monthly-billing/periods/${periodId}/approve`,
  )
  return data.data
}

/** POST …/dispute — reports a problem; the payment is held for Gotham support. */
export async function disputeMonthlyPeriod(
  hireId: string,
  periodId: string,
  report: { reason: string; category: MonthlyDisputeCategory; files: File[] },
): Promise<HireMonthlyBilling> {
  // multipart: reason, category, plus up to 5 files (JPG, PNG or PDF)
  const form = new FormData()
  form.append('reason', report.reason)
  form.append('category', report.category)
  report.files.forEach((file) => form.append('attachments', file))
  // Unset the client's JSON default so axios sends real multipart/form-data.
  const { data } = await apiClient.post<ApiResponse<HireMonthlyBilling>>(
    `/supervision/hires/${hireId}/monthly-billing/periods/${periodId}/dispute`,
    form,
    { headers: { 'Content-Type': undefined } },
  )
  return data.data
}

/** POST …/periods/:periodId/evidence — either side adds a note and/or files to a disputed month. */
export async function addMonthlyDisputeEvidence(
  hireId: string,
  periodId: string,
  evidence: { note: string; files: File[] },
): Promise<HireMonthlyBilling> {
  const form = new FormData()
  if (evidence.note) form.append('note', evidence.note)
  evidence.files.forEach((file) => form.append('attachments', file))
  const { data } = await apiClient.post<ApiResponse<HireMonthlyBilling>>(
    `/supervision/hires/${hireId}/monthly-billing/periods/${periodId}/evidence`,
    form,
    { headers: { 'Content-Type': undefined } },
  )
  return data.data
}

/** GET /supervision/payments/monthly — the user's months across hires. */
export async function getMyMonthlyPayments(page = 1, limit = 10): Promise<MonthlyPaymentsPage> {
  const { data } = await apiClient.get<ApiResponse<MonthlyPaymentsPage>>(
    '/supervision/payments/monthly',
    { params: { page, limit } },
  )
  return data.data
}
