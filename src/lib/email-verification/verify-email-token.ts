import { verifyEmailWithApi } from '@/lib/api/email-verification'

import type { VerifyEmailResult } from './types'

export async function verifyEmailToken(
  token: string | null | undefined,
): Promise<VerifyEmailResult> {
  return verifyEmailWithApi(token ?? '')
}
