import axios from 'axios'

import type { VerifyEmailResult } from '@/lib/email-verification/types'
import { parseApiError } from '@/lib/utils/error-parser'

import { apiClient } from './client'

type BackendVerifyResponse = {
  success?: boolean
  data?: {
    accessToken?: string
    expiresAt?: string
    email?: string
    id?: string
  }
}

/**
 * Live verification call — enable with `NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION_API=true`.
 * Backend route (expected): `GET /auth/email-verification/:activationToken`
 */
export async function verifyEmailWithApi(activationToken: string): Promise<VerifyEmailResult> {
  const token = activationToken.trim()
  if (!token) {
    return {
      kind: 'error',
      code: 'missing_token',
      message: 'Verification link is missing a token.',
    }
  }

  try {
    const { data: body } = await apiClient.get<BackendVerifyResponse>(
      `/auth/email-verification/${encodeURIComponent(token)}`,
    )

    const payload = body?.data
    if (payload?.accessToken) {
      return {
        kind: 'success',
        accessToken: payload.accessToken,
        expiresAt: payload.expiresAt,
      }
    }

    return { kind: 'success' }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const msg = parseApiError(error)

      if (status === 410) {
        const lower = msg.toLowerCase()
        if (lower.includes('expired')) {
          return { kind: 'error', code: 'expired', message: msg }
        }
        return { kind: 'error', code: 'invalid', message: msg }
      }
      if (status === 400) {
        const lower = msg.toLowerCase()
        if (lower.includes('already') || lower.includes('verified')) {
          return { kind: 'error', code: 'already_verified', message: msg }
        }
        return { kind: 'error', code: 'invalid', message: msg }
      }
      if (status === 404) {
        return { kind: 'error', code: 'invalid', message: msg }
      }
      if (!error.response) {
        return {
          kind: 'error',
          code: 'network',
          message: 'Unable to reach the server. Check your connection and try again.',
        }
      }
      return { kind: 'error', code: 'unknown', message: msg }
    }

    return {
      kind: 'error',
      code: 'unknown',
      message: "We couldn't verify your email. Please try again.",
    }
  }
}
