import type { VerifyEmailResult } from './types'

const STUB_DELAY_MS = 700

/**
 * Client-only simulation until `NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION_API=true`.
 * Use special tokens to test error UIs:
 * - `stub-expired` → expired
 * - `stub-invalid` → invalid
 * - `stub-used` / `stub-already` → already verified
 * Anything else non-empty → success
 */
export async function verifyEmailTokenStub(token: string): Promise<VerifyEmailResult> {
  await new Promise((r) => setTimeout(r, STUB_DELAY_MS))

  const t = token.trim()

  if (!t) {
    return {
      kind: 'error',
      code: 'missing_token',
      message:
        'Verification link is missing a token. Open the link from your email or request a new one.',
    }
  }

  if (t === 'stub-expired') {
    return {
      kind: 'error',
      code: 'expired',
      message: 'This verification link has expired.',
    }
  }

  if (t === 'stub-invalid') {
    return {
      kind: 'error',
      code: 'invalid',
      message: 'This verification link is not valid.',
    }
  }

  if (t === 'stub-used' || t === 'stub-already') {
    return {
      kind: 'error',
      code: 'already_verified',
      message: 'This email has already been verified.',
    }
  }

  return {
    kind: 'success',
    // No accessToken — redirect uses `getPostVerificationFallbackPath()` in the flow
  }
}
