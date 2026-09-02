import { verifyEmailWithApi } from '@/lib/api/email-verification'

import type { VerifyEmailResult } from './types'

/**
 * The backend activation token is single-use: the first successful
 * `/supervision/activate` call clears it, so a duplicate request gets a 410
 * even though the account was just activated. React StrictMode re-runs the
 * verification effect in dev, firing exactly that duplicate — so we cache the
 * request per token and let both runs share one result.
 */
const pendingByToken = new Map<string, Promise<VerifyEmailResult>>()

export async function verifyEmailToken(
  token: string | null | undefined,
): Promise<VerifyEmailResult> {
  const normalized = (token ?? '').trim()
  if (!normalized) {
    return verifyEmailWithApi(normalized)
  }

  let pending = pendingByToken.get(normalized)
  if (!pending) {
    pending = verifyEmailWithApi(normalized)
    pendingByToken.set(normalized, pending)
  }

  const result = await pending

  // A network failure may be transient — drop it from the cache so a retry
  // can re-attempt. Terminal outcomes (success, invalid, expired) stay
  // cached; re-requesting them would only re-burn the single-use token.
  if (result.kind === 'error' && result.code === 'network') {
    pendingByToken.delete(normalized)
  }

  return result
}
