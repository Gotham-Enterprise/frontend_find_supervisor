import { apiClient } from './client'

export interface ForgotEmailPayload {
  phone: string
  newPassword: string
}

export interface ForgotPasswordPayload {
  email: string
}

/**
 * Recover account email by verifying phone number and setting a new password.
 * TODO: replace endpoint path once the backend route is defined.
 */
export async function forgotEmail(payload: ForgotEmailPayload): Promise<void> {
  await apiClient.post('/supervision/recover-email', payload)
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
}

/**
 * Complete a password reset using the token from the reset-password email link.
 * TODO: replace endpoint path once the backend route is defined.
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiClient.post('/supervision/reset-password', payload)
}
