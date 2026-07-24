import { describe, expect, it } from 'vitest'

import {
  PROFESSIONAL_CREDENTIALS_MAX_LENGTH,
  professionalCredentialsSchema,
  supervisorSchemaObject,
} from '@/components/Signup/schema'

const VALID_CREDENTIALS = 'Ph.D., NCC, LPC-S (AL), LPC (MI)'

describe('professionalCredentials — supervisor signup schema', () => {
  it('is part of the supervisor schema', () => {
    expect(supervisorSchemaObject.shape.professionalCredentials).toBeDefined()
  })

  it('accepts valid post-nominal letters and preserves formatting', () => {
    const result = professionalCredentialsSchema.safeParse(VALID_CREDENTIALS)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe(VALID_CREDENTIALS)
  })

  it('is optional — undefined and empty string are accepted', () => {
    expect(professionalCredentialsSchema.safeParse(undefined).success).toBe(true)
    expect(professionalCredentialsSchema.safeParse('').success).toBe(true)
  })

  it('accepts exactly the maximum length', () => {
    const max = 'A'.repeat(PROFESSIONAL_CREDENTIALS_MAX_LENGTH)
    expect(professionalCredentialsSchema.safeParse(max).success).toBe(true)
  })

  it('rejects values over the maximum length', () => {
    const tooLong = 'A'.repeat(PROFESSIONAL_CREDENTIALS_MAX_LENGTH + 1)
    expect(professionalCredentialsSchema.safeParse(tooLong).success).toBe(false)
  })

  it('rejects disallowed characters', () => {
    expect(professionalCredentialsSchema.safeParse('Ph.D. <script>').success).toBe(false)
    expect(professionalCredentialsSchema.safeParse('Ph.D.; NCC').success).toBe(false)
  })

  it('allows letters, numbers, spaces, commas, periods, parentheses, and hyphens', () => {
    expect(professionalCredentialsSchema.safeParse('LPC-S (AL) 2, M.Ed.').success).toBe(true)
  })
})
