import axios from 'axios'

import { parseApiError } from '@/lib/utils/error-parser'

export type LoginFailureKind =
  | 'invalid_credentials'
  | 'email_unverified'
  | 'account_deactivated'
  | 'account_locked'
  | 'generic'

export type ParsedLoginError = {
  kind: LoginFailureKind
  message: string
  /** Present when backend returns activation token for unverified email */
  activationToken?: string
}

type BackendLoginErrorBody = {
  success?: boolean
  error?: string
  token?: string
}

export function parseLoginError(error: unknown): ParsedLoginError {
  const fallback: ParsedLoginError = {
    kind: 'generic',
    message: parseApiError(error),
  }

  if (!axios.isAxiosError(error) || !error.response?.data) {
    return fallback
  }

  const data = error.response.data as BackendLoginErrorBody
  const raw = typeof data.error === 'string' ? data.error : ''
  const msg = parseApiError(error)
  const lower = (raw || msg).toLowerCase()

  if (raw === 'Email not verified' || lower.includes('email not verified')) {
    return {
      kind: 'email_unverified',
      message:
        'Your email is not verified yet. Check your inbox for a verification link, or open the link below.',
      activationToken: data.token,
    }
  }

  if (lower.includes('deactivated')) {
    return { kind: 'account_deactivated', message: msg }
  }

  if (lower.includes('locked')) {
    return { kind: 'account_locked', message: msg }
  }

  if (error.response.status === 401) {
    return { kind: 'invalid_credentials', message: msg }
  }

  return fallback
}
