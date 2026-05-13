import { normalizeUSPhoneNumber } from '@/lib/utils/phone'

import { apiClient } from './client'

export interface ForgotEmailPayload {
  /** Account phone number (same as on signup). */
  phone: string
  /** Current account password (used only to verify identity). */
  password: string
  /** Inbox where we send a message containing your login email address. */
  recoveryEmail: string
}

export interface ForgotPasswordPayload {
  email: string
}

/**
 * After verifying phone + password, sends the account login email to `recoveryEmail`.
 */
export async function forgotEmail(payload: ForgotEmailPayload): Promise<void> {
  const phoneNumber = normalizeUSPhoneNumber(payload.phone) ?? payload.phone.trim()
  await apiClient.post('/supervision/forgot-email', {
    phoneNumber,
    password: payload.password,
    recoveryEmail: payload.recoveryEmail.trim(),
  })
}

/**
 * Initiate a password reset by providing the account email address.
 * TODO: replace endpoint path once the backend route is defined.
 */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await apiClient.post('/supervision/forgot-password', payload)
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmPassword: string
}

/**
 * Completes supervision password reset (token from email path `/reset-password/:token`).
 * Backend: `PUT /api/supervision/reset-password/:resetToken` with `password` + `confirmPassword`.
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  const { token, newPassword, confirmPassword } = payload
  await apiClient.put(`/supervision/reset-password/${encodeURIComponent(token)}`, {
    password: newPassword,
    confirmPassword,
  })
}
