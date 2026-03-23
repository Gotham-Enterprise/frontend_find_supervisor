import { verifyEmailWithApi } from '@/lib/api/email-verification'

import { isEmailVerificationApiEnabled } from './config'
import { verifyEmailTokenStub } from './stub-verify-email-token'
import type { VerifyEmailResult } from './types'

/**
 * Single entry for the verify-email page. Uses the API when enabled; otherwise a dev stub.
 */
export async function verifyEmailToken(
  token: string | null | undefined,
): Promise<VerifyEmailResult> {
  if (isEmailVerificationApiEnabled()) {
    return verifyEmailWithApi(token ?? '')
  }
  return verifyEmailTokenStub(token ?? '')
}
