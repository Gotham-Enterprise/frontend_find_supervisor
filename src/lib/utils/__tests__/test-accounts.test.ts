import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import {
  isTestAccountInteractionError,
  isTestToLiveInteraction,
  TEST_ACCOUNT_INTERACTION_ERROR_CODE,
} from '@/lib/utils/test-accounts'

function apiError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  })
}

describe('isTestToLiveInteraction', () => {
  it('flags a test account acting on a live account', () => {
    expect(isTestToLiveInteraction({ isTestAccount: true }, { isTestAccount: false })).toBe(true)
    // Older payloads without the field are live accounts
    expect(isTestToLiveInteraction({ isTestAccount: true }, {})).toBe(true)
  })

  it('allows test ↔ test and any live viewer', () => {
    expect(isTestToLiveInteraction({ isTestAccount: true }, { isTestAccount: true })).toBe(false)
    expect(isTestToLiveInteraction({ isTestAccount: false }, { isTestAccount: false })).toBe(false)
    expect(isTestToLiveInteraction(null, { isTestAccount: false })).toBe(false)
  })
})

describe('isTestAccountInteractionError', () => {
  it('matches the backend errorCode', () => {
    expect(
      isTestAccountInteractionError(
        apiError(403, { error: 'Test accounts…', errorCode: TEST_ACCOUNT_INTERACTION_ERROR_CODE }),
      ),
    ).toBe(true)
  })

  it('ignores other 403s and non-axios errors', () => {
    expect(isTestAccountInteractionError(apiError(403, { error: 'Plan required' }))).toBe(false)
    expect(isTestAccountInteractionError(new Error('boom'))).toBe(false)
  })
})
