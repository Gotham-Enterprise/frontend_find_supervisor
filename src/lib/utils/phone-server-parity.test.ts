import { describe, expect, it } from 'vitest'

import { isServerAcceptedPhoneNumber } from './phone'

/**
 * Expected results pinned against the backend's PhoneNumberService.validatePhoneNumber
 * (same `phone` package + normalization). If one of these flips, the client and server
 * rules have drifted — fix whichever side changed.
 */
describe('isServerAcceptedPhoneNumber (server parity)', () => {
  it.each([
    // Accepted by the server even though strict NANP would reject the 1XX exchange
    ['(423) 123-1252', true],
    ['4231231252', true],
    ['1 (423) 123-1252', true],
    ['+14231231252', true],
    ['(415) 555-2671', true],
    // Rejected by the server
    ['(555) 010-2733', false], // invalid area code — the original QA repro
    ['123', false],
    ['abcdef', false],
    ['(423) 223-12522', false], // 11 digits not starting with 1
    ['+447911123456', false], // valid UK number, but register is US/CA-only
    ['', false],
    ['   ', false],
  ])('%s → %s', (input, expected) => {
    expect(isServerAcceptedPhoneNumber(input)).toBe(expected)
  })
})
