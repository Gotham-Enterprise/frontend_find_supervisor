import axios from 'axios'

import { parseApiError } from '@/lib/utils/error-parser'
import type { ApiResponse } from '@/types/api'
import type {
  HireListResponse,
  HireRecord,
  HireStatus,
  HireSupervisorPayload,
  HireSupervisorRequestInput,
  UpcomingSessionItem,
} from '@/types/hire'
import type { PastClientHire } from '@/types/past-clients'
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

function normalizeStateTheyAreLookingIn(value: string | string[]): string[] {
  const raw = Array.isArray(value) ? value : [value]
  return raw.map((s) => String(s).trim()).filter((s) => s.length > 0)
}

/** POST /api/supervision/hires — supervisee hires a supervisor. */
export async function hireSupervisor(payload: HireSupervisorRequestInput): Promise<HireRecord> {
  const body: HireSupervisorPayload = {
    ...payload,
    stateTheyAreLookingIn: normalizeStateTheyAreLookingIn(payload.stateTheyAreLookingIn),
  }
  const { data } = await apiClient.post<ApiResponse<HireRecord>>('/supervision/hires', body)
  return data.data
}

/** GET /api/supervision/hires — paginated hire list for the authenticated user (supervisor or supervisee). */
export async function listHires(
  page = 1,
  limit = 10,
  status?: HireStatus | HireStatus[],
): Promise<HireListResponse> {
  const statusParam =
    status === undefined
      ? {}
      : {
          status: Array.isArray(status) ? status.join(',') : status,
        }
  const { data } = await apiClient.get<ApiResponse<HireListResponse>>('/supervision/hires', {
    params: { page, limit, ...statusParam },
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
  subject: string
  message: string
}

/** POST /supervision/contact-us — submit a contact request (public). */
export async function submitContactUs(payload: ContactUsPayload): Promise<void> {
  await apiClient.post('/supervision/contact-us', payload)
}
