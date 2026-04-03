import axios from 'axios'

import { parseApiError } from '@/lib/utils/error-parser'
import type { ApiResponse } from '@/types/api'
import type { SubscriptionPlan } from '@/types/supervisor-profile'

import { apiClient } from './client'

/** GET /supervision/plans — active subscription plans (auth: supervisor | supervisee). */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/supervision/plans')
  return data.data
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
