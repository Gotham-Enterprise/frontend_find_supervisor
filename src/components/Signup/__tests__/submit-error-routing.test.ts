import { describe, expect, it } from 'vitest'

import {
  licenseEntrySchema,
  SUPERVISEE_SIGNUP_STEP_FIELDS,
  SUPERVISOR_SIGNUP_STEP_FIELDS,
} from '@/components/Signup/schema'
import { findFirstStepWithError } from '@/components/Signup/SupervisorSignupForm/applyZodIssuesToForm'
import { toLocalISODate } from '@/lib/utils/date'

describe('findFirstStepWithError', () => {
  it('returns the step containing the errored field', () => {
    expect(findFirstStepWithError(['email'], SUPERVISOR_SIGNUP_STEP_FIELDS)).toBe(0)
    expect(findFirstStepWithError(['licenseDoc'], SUPERVISOR_SIGNUP_STEP_FIELDS)).toBe(1)
    expect(findFirstStepWithError(['agreedToTerms'], SUPERVISOR_SIGNUP_STEP_FIELDS)).toBe(2)
    expect(findFirstStepWithError(['typeOfSupervisor'], SUPERVISEE_SIGNUP_STEP_FIELDS)).toBe(1)
  })

  it('returns the earliest step when several steps have errors', () => {
    expect(
      findFirstStepWithError(
        ['agreedToTerms', 'password', 'licenseNumber'],
        SUPERVISOR_SIGNUP_STEP_FIELDS,
      ),
    ).toBe(0)
  })

  it('matches nested paths on their root field', () => {
    expect(findFirstStepWithError(['licenses.0.state'], SUPERVISOR_SIGNUP_STEP_FIELDS)).toBe(1)
  })

  it('returns -1 when no path belongs to any step', () => {
    expect(findFirstStepWithError(['unknownField'], SUPERVISOR_SIGNUP_STEP_FIELDS)).toBe(-1)
    expect(findFirstStepWithError([], SUPERVISOR_SIGNUP_STEP_FIELDS)).toBe(-1)
  })
})

describe('licenseExpiration (timezone-safe)', () => {
  const schema = licenseEntrySchema.shape.licenseExpiration
  const DAY_MS = 24 * 60 * 60 * 1000

  it('accepts a license expiring today (local date)', () => {
    expect(schema.safeParse(toLocalISODate(new Date())).success).toBe(true)
  })

  it('accepts a future date and rejects a past date', () => {
    expect(schema.safeParse(toLocalISODate(new Date(Date.now() + DAY_MS))).success).toBe(true)
    expect(schema.safeParse(toLocalISODate(new Date(Date.now() - DAY_MS))).success).toBe(false)
  })

  it('rejects empty values', () => {
    expect(schema.safeParse('').success).toBe(false)
  })
})
