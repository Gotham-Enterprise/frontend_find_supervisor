import axios from 'axios'

import type { VerifyEmailResult } from '@/lib/email-verification/types'
import { parseApiError } from '@/lib/utils/error-parser'

import { apiClient } from './client'

type ActivateAccountResponse = {
  isAuthenticated?: boolean
  success?: boolean
  data?: {
    id?: string
    email?: string
    fullName?: string
    role?: string
    status?: string
  }
  token?: string
  refreshToken?: string
}

/**
 * Calls `GET /supervision/activate/:activationToken` to verify and activate the account.
 * Returns the access token and user role on success.
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
    const { data: body } = await apiClient.get<ActivateAccountResponse>(
      `/supervision/activate/${encodeURIComponent(token)}`,
    )

    return {
      kind: 'success',
      accessToken: body?.token,
      role: body?.data?.role,
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const msg = parseApiError(error)

      if (status === 410) {
        const lower = msg.toLowerCase()
        if (lower.includes('expired')) {
          return {
            kind: 'error',
            code: 'expired',
            message: 'This verification link has expired. Please request a new verification email.',
          }
        }
        return {
          kind: 'error',
          code: 'invalid',
          message: 'This verification link is invalid or has expired.',
        }
      }
      if (status === 400) {
        const lower = msg.toLowerCase()
        if (lower.includes('already') || lower.includes('verified')) {
          return {
            kind: 'error',
            code: 'already_verified',
            message: 'This email has already been verified. You can sign in now.',
          }
        }
        return { kind: 'error', code: 'invalid', message: msg }
      }
      if (status === 404) {
        return {
          kind: 'error',
          code: 'invalid',
          message:
            'This verification link is invalid or has expired. Please request a new verification email.',
        }
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
