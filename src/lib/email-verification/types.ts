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
  accessToken?: string
  expiresAt?: string
  /** User role returned by the activation endpoint (e.g. "SUPERVISOR", "SUPERVISEE") */
  role?: string
}

export type VerifyEmailFailure = {
  kind: 'error'
  code: EmailVerificationErrorCode
  /** Server or stub message when available */
  message: string
}

export type VerifyEmailResult = VerifyEmailSuccess | VerifyEmailFailure
