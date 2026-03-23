/**
 * When `NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION_API` is `"true"`, the app calls
 * `GET /api/auth/email-verification/:activationToken` (see `src/lib/api/email-verification.ts`).
 * Until the backend contract is stable, leave this unset or `false` to use the client stub.
 */
export function isEmailVerificationApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION_API === 'true'
}

/** Where to send the user after successful verification when no access token is returned */
export function getPostVerificationFallbackPath(): string {
  return process.env.NEXT_PUBLIC_POST_VERIFY_REDIRECT ?? '/login?verified=1'
}

export const AUTO_REDIRECT_MS = 2800
