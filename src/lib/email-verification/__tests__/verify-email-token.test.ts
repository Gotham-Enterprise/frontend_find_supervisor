import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { VerifyEmailResult } from '@/lib/email-verification/types'

const verifyEmailWithApi = vi.fn<(token: string) => Promise<VerifyEmailResult>>()

vi.mock('@/lib/api/email-verification', () => ({
  verifyEmailWithApi: (token: string) => verifyEmailWithApi(token),
}))

const success: VerifyEmailResult = { kind: 'success', accessToken: 'jwt', role: 'SUPERVISEE' }
const networkError: VerifyEmailResult = {
  kind: 'error',
  code: 'network',
  message: 'Unable to reach the server.',
}
const invalidError: VerifyEmailResult = {
  kind: 'error',
  code: 'invalid',
  message: 'This verification link is invalid or has expired.',
}

// The module caches per token, so each test needs a fresh module instance.
async function loadVerifyEmailToken() {
  vi.resetModules()
  const mod = await import('@/lib/email-verification/verify-email-token')
  return mod.verifyEmailToken
}

beforeEach(() => {
  verifyEmailWithApi.mockReset()
})

describe('verifyEmailToken', () => {
  it('shares one request across concurrent duplicate calls (StrictMode double effect)', async () => {
    const verifyEmailToken = await loadVerifyEmailToken()
    verifyEmailWithApi.mockResolvedValue(success)

    const [first, second] = await Promise.all([
      verifyEmailToken('token-1'),
      verifyEmailToken('token-1'),
    ])

    expect(verifyEmailWithApi).toHaveBeenCalledTimes(1)
    expect(first).toEqual(success)
    expect(second).toEqual(success)
  })

  it('returns the cached success for a later call with the same token', async () => {
    const verifyEmailToken = await loadVerifyEmailToken()
    verifyEmailWithApi.mockResolvedValue(success)

    await verifyEmailToken('token-1')
    const again = await verifyEmailToken('token-1')

    expect(verifyEmailWithApi).toHaveBeenCalledTimes(1)
    expect(again).toEqual(success)
  })

  it('requests separately for different tokens', async () => {
    const verifyEmailToken = await loadVerifyEmailToken()
    verifyEmailWithApi.mockResolvedValue(success)

    await verifyEmailToken('token-1')
    await verifyEmailToken('token-2')

    expect(verifyEmailWithApi).toHaveBeenCalledTimes(2)
  })

  it('re-attempts after a network error', async () => {
    const verifyEmailToken = await loadVerifyEmailToken()
    verifyEmailWithApi.mockResolvedValueOnce(networkError).mockResolvedValueOnce(success)

    const first = await verifyEmailToken('token-1')
    const second = await verifyEmailToken('token-1')

    expect(verifyEmailWithApi).toHaveBeenCalledTimes(2)
    expect(first).toEqual(networkError)
    expect(second).toEqual(success)
  })

  it('keeps terminal errors cached instead of re-burning the token', async () => {
    const verifyEmailToken = await loadVerifyEmailToken()
    verifyEmailWithApi.mockResolvedValue(invalidError)

    await verifyEmailToken('token-1')
    const again = await verifyEmailToken('token-1')

    expect(verifyEmailWithApi).toHaveBeenCalledTimes(1)
    expect(again).toEqual(invalidError)
  })

  it('passes blank tokens through without caching', async () => {
    const verifyEmailToken = await loadVerifyEmailToken()
    const missingToken: VerifyEmailResult = {
      kind: 'error',
      code: 'missing_token',
      message: 'Verification link is missing a token.',
    }
    verifyEmailWithApi.mockResolvedValue(missingToken)

    await verifyEmailToken('   ')
    await verifyEmailToken(null)

    expect(verifyEmailWithApi).toHaveBeenCalledTimes(2)
    expect(verifyEmailWithApi).toHaveBeenCalledWith('')
  })
})
