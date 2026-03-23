/** Maps to UI copy and recovery actions */
export type EmailVerificationErrorCode =
  | 'missing_token'
  | 'invalid'
  | 'expired'
  | 'already_verified'
  | 'network'
  | 'unknown'

export type VerifyEmailSuccess = {
  kind: 'success'
  /** Present when the backend returns a session (optional; many flows only verify email) */
  accessToken?: string
  expiresAt?: string
}

export type VerifyEmailFailure = {
  kind: 'error'
  code: EmailVerificationErrorCode
  /** Server or stub message when available */
  message: string
}

export type VerifyEmailResult = VerifyEmailSuccess | VerifyEmailFailure
