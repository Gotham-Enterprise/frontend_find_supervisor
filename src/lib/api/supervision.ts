import axios from 'axios'

import { parseApiError } from '@/lib/utils/error-parser'
import { requiresSupervisionHours } from '@/lib/utils/profile-formatters'
import type { ApiResponse } from '@/types/api'
import type {
  AgreementRecord,
  HireListResponse,
  HireRecord,
  HireStatus,
  HireSupervisorPayload,
  HireSupervisorRequestInput,
  PreviewAgreementInput,
  ProposeAgreementInput,
  SignAgreementPayload,
  UpcomingSessionItem,
} from '@/types/hire'
import type { PastClientHire } from '@/types/past-clients'
import type {
  HirePaymentInfo,
  HourlyQuote,
  PayoutRemovalCheck,
  PayoutStatus,
  StripeLink,
  SuperviseeCards,
  SuperviseePayments,
  SuperviseeWeekSummary,
} from '@/types/payouts'
import type {
  HireBillingWeeks,
  HireSessionInput,
  PayNowIntent,
  SupervisorEarnings,
  SupervisorWeekSummary,
} from '@/types/sessions'
import type {
  PurchaseSubscriptionResponse,
  Subscription,
  SubscriptionPlan,
} from '@/types/supervisor-profile'

import { apiClient } from './client'

/** GET /supervision/plans — active subscription plans (auth: supervisor | supervisee). */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/supervision/plans')
  return data.data
}

/** GET /supervision/payments/current-subscription — latest subscription row; `data` may be null. */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  const { data } = await apiClient.get<ApiResponse<Subscription | null>>(
    '/supervision/payments/current-subscription',
  )
  return data.data ?? null
}

/**
 * POST /supervision/payments/cancel-subscription
 *
 * Sets cancel_at_period_end = true on the active Stripe subscription so access
 * remains until the current billing period ends. No request body is required —
 * the backend identifies the subscription from the auth cookie.
 */
export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await apiClient.post<ApiResponse<Subscription>>(
    '/supervision/payments/cancel-subscription',
  )
  return data.data
}

/**
 * POST /supervision/payments/reactivate-subscription
 *
 * Undoes cancel_at_period_end on an active Stripe subscription so billing
 * resumes at the next renewal. No request body — the backend identifies the
 * subscription from the auth cookie.
 */
export async function reactivateSubscription(): Promise<Subscription> {
  const { data } = await apiClient.post<ApiResponse<Subscription>>(
    '/supervision/payments/reactivate-subscription',
  )
  return data.data
}

/** GET /supervision/payments/connect/status — supervisor payout account status (auth: supervisor). */
export async function getPayoutStatus(): Promise<PayoutStatus> {
  const { data } = await apiClient.get<ApiResponse<PayoutStatus>>(
    '/supervision/payments/connect/status',
  )
  return data.data
}

/**
 * POST /supervision/payments/connect/onboarding-link
 *
 * Creates the supervisor's Stripe Express account on first use and returns a
 * single-use Stripe-hosted onboarding URL. Stripe redirects back to
 * /billing?payouts=return (done) or /billing?payouts=refresh (link expired).
 */
export async function createPayoutOnboardingLink(): Promise<StripeLink> {
  const { data } = await apiClient.post<ApiResponse<StripeLink>>(
    '/supervision/payments/connect/onboarding-link',
  )
  return data.data
}

/**
 * POST /supervision/payments/connect/account-session — client secret for the
 * embedded account management component (bank account, personal details).
 */
export async function createPayoutAccountSession(): Promise<{ clientSecret: string }> {
  const { data } = await apiClient.post<ApiResponse<{ clientSecret: string }>>(
    '/supervision/payments/connect/account-session',
  )
  return data.data
}

/** GET /supervision/payments/connect/removal-check — what still depends on the payout account. */
export async function getPayoutRemovalCheck(): Promise<PayoutRemovalCheck> {
  const { data } = await apiClient.get<ApiResponse<PayoutRemovalCheck>>(
    '/supervision/payments/connect/removal-check',
  )
  return data.data
}

/** DELETE /supervision/payments/connect/account — deletes the payout account (409 while in use). */
export async function removePayoutAccount(): Promise<{ removed: boolean }> {
  const { data } = await apiClient.delete<ApiResponse<{ removed: boolean }>>(
    '/supervision/payments/connect/account',
  )
  return data.data
}

/** GET /supervision/payments/quote — weekly prepay/payout breakdown for prospective hourly terms. */
export async function getHourlyQuote(
  hourlyRate: number,
  maxHoursPerWeek: number,
): Promise<HourlyQuote> {
  const { data } = await apiClient.get<ApiResponse<HourlyQuote>>('/supervision/payments/quote', {
    params: { hourlyRate, maxHoursPerWeek },
  })
  return data.data
}

/** GET /supervision/hires/:hireId/payment — hourly billing summary (supervisor or supervisee). */
export async function getHirePayment(hireId: string): Promise<HirePaymentInfo> {
  const { data } = await apiClient.get<ApiResponse<HirePaymentInfo>>(
    `/supervision/hires/${hireId}/payment`,
  )
  return data.data
}

/** POST /supervision/hires/:hireId/payment/setup-intent — SetupIntent for saving a new card. */
export async function createHirePaymentSetupIntent(
  hireId: string,
): Promise<{ clientSecret: string }> {
  const { data } = await apiClient.post<ApiResponse<{ clientSecret: string }>>(
    `/supervision/hires/${hireId}/payment/setup-intent`,
  )
  return data.data
}

/**
 * PUT /supervision/hires/:hireId/payment/card — saves (or replaces) the card
 * the weekly prepays are charged to. Nothing is charged here.
 */
export async function saveHirePaymentMethod(
  hireId: string,
  paymentMethodId: string,
): Promise<HirePaymentInfo> {
  const { data } = await apiClient.put<ApiResponse<HirePaymentInfo>>(
    `/supervision/hires/${hireId}/payment/card`,
    { paymentMethodId },
  )
  return data.data
}

/** GET /supervision/payments/earnings — the supervisor's in-app earnings across hires. */
export async function getSupervisorEarnings(
  page = 1,
  limit = 10,
  hireId?: string | null,
): Promise<SupervisorEarnings> {
  const { data } = await apiClient.get<ApiResponse<SupervisorEarnings>>(
    '/supervision/payments/earnings',
    { params: { page, limit, ...(hireId ? { hireId } : {}) } },
  )
  return data.data
}

/** GET /supervision/payments/earnings/week — hours per day per supervisee for one week. */
export async function getSupervisorWeekSummary(
  start?: string | null,
): Promise<SupervisorWeekSummary> {
  const { data } = await apiClient.get<ApiResponse<SupervisorWeekSummary>>(
    '/supervision/payments/earnings/week',
    { params: start ? { start } : {} },
  )
  return data.data
}

/** GET /supervision/payments/earnings/export — the same earnings as a CSV file. */
export async function exportSupervisorEarnings(): Promise<Blob> {
  const { data } = await apiClient.get<Blob>('/supervision/payments/earnings/export', {
    responseType: 'blob',
  })
  return data
}

/** GET /supervision/payments/cards — the supervisee's saved cards and which hires use them. */
export async function getSuperviseeCards(): Promise<SuperviseeCards> {
  const { data } = await apiClient.get<ApiResponse<SuperviseeCards>>('/supervision/payments/cards')
  return data.data
}

/** POST /supervision/payments/cards/setup-intent — SetupIntent for adding an account-level card. */
export async function createSuperviseeCardSetupIntent(): Promise<{ clientSecret: string }> {
  const { data } = await apiClient.post<ApiResponse<{ clientSecret: string }>>(
    '/supervision/payments/cards/setup-intent',
  )
  return data.data
}

/** DELETE /supervision/payments/cards/:paymentMethodId — detach a card no active hire uses. */
export async function removeSuperviseeCard(paymentMethodId: string): Promise<SuperviseeCards> {
  const { data } = await apiClient.delete<ApiResponse<SuperviseeCards>>(
    `/supervision/payments/cards/${encodeURIComponent(paymentMethodId)}`,
  )
  return data.data
}

/** GET /supervision/payments/history — the supervisee's weekly charges and refunds across hires. */
export async function getSuperviseePayments(page = 1, limit = 10): Promise<SuperviseePayments> {
  const { data } = await apiClient.get<ApiResponse<SuperviseePayments>>(
    '/supervision/payments/history',
    { params: { page, limit } },
  )
  return data.data
}

/** GET /supervision/payments/history/week — hours per day per supervisor for one week. */
export async function getSuperviseeWeekSummary(
  start?: string | null,
): Promise<SuperviseeWeekSummary> {
  const { data } = await apiClient.get<ApiResponse<SuperviseeWeekSummary>>(
    '/supervision/payments/history/week',
    { params: start ? { start } : {} },
  )
  return data.data
}

/** GET /supervision/payments/history/:weekId/receipt — Stripe's receipt page for the prepay. */
export async function getSuperviseeReceiptUrl(weekId: string): Promise<string> {
  const { data } = await apiClient.get<ApiResponse<{ url: string }>>(
    `/supervision/payments/history/${weekId}/receipt`,
  )
  return data.data.url
}

/** GET /supervision/payments/history/export — the same payments as a CSV file. */
export async function exportSuperviseePayments(): Promise<Blob> {
  const { data } = await apiClient.get<Blob>('/supervision/payments/history/export', {
    responseType: 'blob',
  })
  return data
}

/** GET /supervision/hires/:hireId/billing-weeks — sessions and weekly review state (both parties). */
export async function getHireBillingWeeks(hireId: string): Promise<HireBillingWeeks> {
  const { data } = await apiClient.get<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/billing-weeks`,
  )
  return data.data
}

/** POST /supervision/hires/:hireId/sessions — supervisor logs a session. */
/**
 * POST /supervision/hires/:hireId/late-entry-requests — ask support to add a
 * session to a closed week. Returns the refreshed billing weeks, with the
 * request listed under its week.
 */
export async function requestLateEntry(
  hireId: string,
  input: HireSessionInput,
): Promise<HireBillingWeeks> {
  const { data } = await apiClient.post<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/late-entry-requests`,
    input,
  )
  return data.data
}

export async function logHireSession(
  hireId: string,
  input: HireSessionInput,
): Promise<HireBillingWeeks> {
  const { data } = await apiClient.post<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/sessions`,
    input,
  )
  return data.data
}

/** PUT /supervision/hires/:hireId/sessions/:sessionId — while its week is open. */
export async function updateHireSession(
  hireId: string,
  sessionId: string,
  input: HireSessionInput,
): Promise<HireBillingWeeks> {
  const { data } = await apiClient.put<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/sessions/${sessionId}`,
    input,
  )
  return data.data
}

/** DELETE /supervision/hires/:hireId/sessions/:sessionId — while its week is open. */
export async function deleteHireSession(
  hireId: string,
  sessionId: string,
): Promise<HireBillingWeeks> {
  const { data } = await apiClient.delete<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/sessions/${sessionId}`,
  )
  return data.data
}

/**
 * POST /supervision/hires/:hireId/sessions/:sessionId/approve | reject — the
 * supervisee answers a late session added by Gotham support. Approving one on
 * a settled week charges it (hours × rate + service fee) right away.
 */
export async function respondToLateSession(
  hireId: string,
  sessionId: string,
  approve: boolean,
): Promise<HireBillingWeeks> {
  const { data } = await apiClient.post<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/sessions/${sessionId}/${approve ? 'approve' : 'reject'}`,
  )
  return data.data
}

/** POST /supervision/hires/:hireId/billing-weeks/:weekId/approve — supervisee approves a week. */
export async function approveBillingWeek(
  hireId: string,
  weekId: string,
): Promise<HireBillingWeeks> {
  const { data } = await apiClient.post<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/billing-weeks/${weekId}/approve`,
  )
  return data.data
}

/** POST /supervision/hires/:hireId/billing-weeks/:weekId/dispute — supervisee disputes a week. */
export async function disputeBillingWeek(
  hireId: string,
  weekId: string,
  reason: string,
  attachments: File[] = [],
): Promise<HireBillingWeeks> {
  // multipart: the reason plus up to 3 evidence images
  const form = new FormData()
  form.append('reason', reason)
  attachments.forEach((file) => form.append('attachments', file))
  // Unset the client's JSON default so axios sends real multipart/form-data
  // (with the JSON content type it would serialise the FormData and drop the files).
  const { data } = await apiClient.post<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/billing-weeks/${weekId}/dispute`,
    form,
    { headers: { 'Content-Type': undefined } },
  )
  return data.data
}

/**
 * POST /supervision/hires/:hireId/billing-weeks/:weekId/pay-now — starts paying
 * an unpaid week with the saved card; Stripe.js confirms the returned intent.
 */
export async function payNowBillingWeek(hireId: string, weekId: string): Promise<PayNowIntent> {
  const { data } = await apiClient.post<ApiResponse<PayNowIntent>>(
    `/supervision/hires/${hireId}/billing-weeks/${weekId}/pay-now`,
  )
  return data.data
}

/** POST …/pay-now/sync — refreshes the week after Stripe.js confirmed the payment. */
export async function syncPayNowBillingWeek(
  hireId: string,
  weekId: string,
): Promise<HireBillingWeeks> {
  const { data } = await apiClient.post<ApiResponse<HireBillingWeeks>>(
    `/supervision/hires/${hireId}/billing-weeks/${weekId}/pay-now/sync`,
  )
  return data.data
}

/**
 * POST /supervision/payments/purchase-subscription
 *
 * Initiates a Stripe subscription for the given plan. The backend:
 *  1. Creates/reuses a Stripe Customer for the authenticated user
 *  2. Creates a Stripe Subscription with payment_behavior: "default_incomplete"
 *  3. Returns a `clientSecret` from latest_invoice.confirmation_secret
 *
 * The frontend must then call:
 *   stripe.confirmPayment({ elements, clientSecret, confirmParams: { return_url } })
 *
 * The subscription stays INACTIVE until the Stripe webhook confirms payment.
 *
 * @param subscriptionPlanId — The UUID of the plan (query param `planId` from the URL)
 */
export async function purchaseSubscription(
  subscriptionPlanId: string,
): Promise<PurchaseSubscriptionResponse> {
  const { data } = await apiClient.post<ApiResponse<PurchaseSubscriptionResponse>>(
    '/supervision/payments/purchase-subscription',
    { subscriptionPlanId },
  )
  return data.data
}

function normalizeSupervisionHours(
  typeOfSupervisorNeeded: string | string[],
  supervisionHours: number | null | undefined,
): number | null {
  const type = Array.isArray(typeOfSupervisorNeeded)
    ? typeOfSupervisorNeeded[0]
    : typeOfSupervisorNeeded
  if (!requiresSupervisionHours(type)) return null
  if (supervisionHours == null || Number.isNaN(supervisionHours)) return null
  return supervisionHours
}

/** POST /api/supervision/hires — supervisee hires a supervisor. */
export async function hireSupervisor(payload: HireSupervisorRequestInput): Promise<HireRecord> {
  const body: HireSupervisorPayload = {
    ...payload,
    supervisionHours: normalizeSupervisionHours(
      payload.typeOfSupervisorNeeded,
      payload.supervisionHours,
    ),
  }
  const { data } = await apiClient.post<ApiResponse<HireRecord>>('/supervision/hires', body)
  return data.data
}

/** GET /api/supervision/hires — paginated hire list for the authenticated user (supervisor or supervisee). */
export type HiresListMode = 'supervisors' | 'medicalDirectors'

/** Status groups behind the hire list filters (server-side). */
export type HireListGroup = 'needs_action' | 'pending' | 'active' | 'completed' | 'closed'

export interface HireListFilters {
  /** Name search on the other party. */
  search?: string
  group?: HireListGroup
  /** Leave out requests still awaiting the supervisor's decision (PENDING, REVIEWED). */
  excludePending?: boolean
}

export async function listHires(
  page = 1,
  limit = 10,
  status?: HireStatus | HireStatus[],
  mode?: HiresListMode,
  filters: HireListFilters = {},
): Promise<HireListResponse> {
  const statusParam =
    status === undefined
      ? {}
      : {
          status: Array.isArray(status) ? status.join(',') : status,
        }
  const modeParam = mode ? { mode } : {}
  const search = filters.search?.trim()
  const filterParams = {
    ...(search ? { search } : {}),
    ...(filters.group ? { group: filters.group } : {}),
    ...(filters.excludePending ? { excludePending: 'true' } : {}),
  }
  const { data } = await apiClient.get<ApiResponse<HireListResponse>>('/supervision/hires', {
    params: { page, limit, ...statusParam, ...modeParam, ...filterParams },
  })
  return data.data
}

/**
 * GET /supervision/supervisors/past-clients — completed/reviewed hires for a supervisor profile.
 * Query `id` is the supervisor UUID (same as GET /supervision/supervisor/profile). `limit: 0` returns all.
 */
export async function getPastClients(params: {
  supervisorId: string
  page?: number
  limit?: number
}): Promise<PastClientHire[]> {
  const { supervisorId, page = 1, limit = 0 } = params
  const { data } = await apiClient.get<ApiResponse<PastClientHire[]>>(
    '/supervision/supervisors/past-clients',
    {
      params: { id: supervisorId, page, limit },
    },
  )
  return data.data
}

/** GET /api/supervision/supervisee/upcoming-sessions — accepted/active hires with a future session date (supervisee only). */
export async function getSuperviseeUpcomingSessions(): Promise<UpcomingSessionItem[]> {
  const { data } = await apiClient.get<ApiResponse<UpcomingSessionItem[]>>(
    '/supervision/supervisee/upcoming-sessions',
  )
  return data.data
}

/** PATCH /supervision/hires/:hireId/view — supervisor marks a PENDING request as viewed (REVIEWED). */
export async function viewHire(hireId: string): Promise<void> {
  await apiClient.patch(`/supervision/hires/${hireId}/view`)
}

/** PATCH /supervision/hires/:hireId/accept — supervisor accepts a hire request. */
export async function acceptHire(hireId: string): Promise<void> {
  await apiClient.patch(`/supervision/hires/${hireId}/accept`)
}

/** PATCH /supervision/hires/:hireId/reject — supervisor rejects a hire request. */
export async function rejectHire(hireId: string, reason: string): Promise<void> {
  await apiClient.patch(`/supervision/hires/${hireId}/reject`, { reason })
}

/** PATCH /supervision/hires/:hireId/cancel — cancel a hire request. */
export async function cancelHire(hireId: string): Promise<void> {
  await apiClient.patch(`/supervision/hires/${hireId}/cancel`)
}

/** PATCH /supervision/hires/:hireId/complete — mark a hire as completed (supervisor or supervisee). */
export async function markHireAsCompleted(hireId: string): Promise<void> {
  await apiClient.patch(`/supervision/hires/${hireId}/complete`)
}

// ─── Supervision agreement ────────────────────────────────────────────────────

function buildAgreementFormData(input: ProposeAgreementInput): FormData {
  const formData = new FormData()
  formData.append('source', input.source)
  formData.append('startDate', input.startDate)
  // Monthly or hourly terms, whichever the form collected (hourly for in-app billed hires).
  if (input.supervisionMonths != null) {
    formData.append('supervisionMonths', String(input.supervisionMonths))
  }
  if (input.monthlyAmount != null) formData.append('monthlyAmount', String(input.monthlyAmount))
  if (input.hourlyRate != null) formData.append('hourlyRate', String(input.hourlyRate))
  if (input.maxHoursPerWeek != null) {
    formData.append('maxHoursPerWeek', String(input.maxHoursPerWeek))
  }
  if (input.totalHours != null) formData.append('totalHours', String(input.totalHours))
  formData.append('signatureName', input.signatureName.trim())
  if (input.source === 'UPLOADED' && input.file) {
    formData.append('file', input.file)
  }
  return formData
}

/** POST /supervision/hires/:hireId/agreement — supervisor proposes + signs an agreement (multipart). */
export async function proposeAgreement(
  hireId: string,
  input: ProposeAgreementInput,
): Promise<AgreementRecord> {
  // Content-Type: undefined clears the client's application/json default — otherwise
  // axios converts the FormData to JSON and the file is dropped ({}).
  const { data } = await apiClient.post<ApiResponse<AgreementRecord>>(
    `/supervision/hires/${hireId}/agreement`,
    buildAgreementFormData(input),
    { headers: { 'Content-Type': undefined } },
  )
  return data.data
}

/**
 * PATCH /supervision/hires/:hireId/agreement — supervisor edits an agreement the
 * supervisee has not signed yet. Bumps `version`, invalidating the pending
 * signature request. Rejected by the backend once both parties have signed.
 */
export async function updateAgreement(
  hireId: string,
  input: ProposeAgreementInput,
): Promise<AgreementRecord> {
  const { data } = await apiClient.patch<ApiResponse<AgreementRecord>>(
    `/supervision/hires/${hireId}/agreement`,
    buildAgreementFormData(input),
    { headers: { 'Content-Type': undefined } },
  )
  return data.data
}

/**
 * POST /supervision/hires/:hireId/agreement/remind — nudge the supervisee to
 * sign the pending agreement. The backend throttles this to once per 24 hours.
 */
export async function remindAgreement(hireId: string): Promise<AgreementRecord> {
  const { data } = await apiClient.post<ApiResponse<AgreementRecord>>(
    `/supervision/hires/${hireId}/agreement/remind`,
  )
  return data.data
}

/**
 * POST /supervision/hires/:hireId/agreement/preview — renders the default
 * template PDF with the given terms and returns it as a Blob. Nothing is saved.
 */
export async function previewAgreement(
  hireId: string,
  input: PreviewAgreementInput,
): Promise<Blob> {
  const { data } = await apiClient.post<Blob>(
    `/supervision/hires/${hireId}/agreement/preview`,
    input,
    { responseType: 'blob' },
  )
  return data
}

/** POST /supervision/hires/:hireId/agreement/sign — supervisee countersigns; backend sets hire agreedAt. */
export async function signAgreement(
  hireId: string,
  payload: SignAgreementPayload,
): Promise<AgreementRecord> {
  const { data } = await apiClient.post<ApiResponse<AgreementRecord>>(
    `/supervision/hires/${hireId}/agreement/sign`,
    { signatureName: payload.signatureName.trim() },
  )
  return data.data
}

/** GET /supervision/hires/:hireId/agreement — agreement for a hire; `data` may be null. */
export async function getAgreement(hireId: string): Promise<AgreementRecord | null> {
  const { data } = await apiClient.get<ApiResponse<AgreementRecord | null>>(
    `/supervision/hires/${hireId}/agreement`,
  )
  return data.data ?? null
}

export type ResendEmailResult =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

/**
 * Calls `GET /supervision/resend-email/:token` to trigger a new verification email.
 * The token is the activationToken returned at signup and carried in the URL.
 */
export async function resendVerificationEmail(token: string): Promise<ResendEmailResult> {
  if (!token.trim()) {
    return {
      kind: 'error',
      message: "We couldn't find the verification details for this request.",
    }
  }

  try {
    await apiClient.get(`/supervision/resend-email/${encodeURIComponent(token.trim())}`)
    return { kind: 'success', message: 'We sent you another verification email.' }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return {
          kind: 'error',
          message: 'Unable to reach the server. Please check your connection and try again.',
        }
      }

      const status = error.response?.status
      const msg = parseApiError(error)

      if (status === 404 || status === 410) {
        return {
          kind: 'error',
          message: 'This verification link is invalid or has expired. Please sign up again.',
        }
      }
      if (status === 429) {
        return {
          kind: 'error',
          message: 'Too many resend requests. Please wait a moment before trying again.',
        }
      }

      return { kind: 'error', message: msg }
    }

    return {
      kind: 'error',
      message: "We couldn't resend the verification email right now. Please try again later.",
    }
  }
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/** PUT /api/supervision/change-password — change the authenticated user's password. */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put('/supervision/change-password', payload)
}

export interface ContactUsPayload {
  fullName: string
  email: string
  /** Optional — max 30 chars */
  phone?: string
  /** Topic code — must exist on `SupervisionContactUsReason` (see GET contact-us/reasons). */
  reason: string
  subject: string
  message: string
}

export type ContactUsReasonRow = {
  code: string
  label: string
  sortOrder: number
}

/** GET /supervision/contact-us/reasons — topic options for the contact form (public). */
export async function getContactUsReasons(): Promise<ContactUsReasonRow[]> {
  const { data } = await apiClient.get<ApiResponse<ContactUsReasonRow[]>>(
    '/supervision/contact-us/reasons',
  )
  return data.data ?? []
}

/** POST /supervision/contact-us — submit a contact request (public). */
export async function submitContactUs(payload: ContactUsPayload): Promise<void> {
  await apiClient.post('/supervision/contact-us', payload)
}
