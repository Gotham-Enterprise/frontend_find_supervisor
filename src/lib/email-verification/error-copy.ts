import type { EmailVerificationErrorCode } from './types'

export function headlineForVerificationError(code: EmailVerificationErrorCode): string {
  switch (code) {
    case 'missing_token':
      return 'Verification link is invalid'
    case 'expired':
      return 'This verification link has expired'
    case 'invalid':
      return 'Verification link is invalid'
    case 'already_verified':
      return 'Email already verified'
    case 'network':
      return 'Connection problem'
    default:
      return "We couldn't verify your email"
  }
}

export const DEFAULT_ERROR_SUPPORTING =
  'The link you used may be expired, already used, or incomplete. Try opening the latest email or request a new verification email.'
