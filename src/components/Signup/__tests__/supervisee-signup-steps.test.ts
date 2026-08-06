import { describe, expect, it } from 'vitest'

import {
  SUPERVISEE_SIGNUP_STEP_FIELDS,
  superviseeStep2Schema,
  superviseeStep3Schema,
} from '@/components/Signup/schema'

const validStep2Values = {
  title: 'AMFT',
  occupationId: '12',
  specialtyId: '',
  typeOfSupervisor: 'Mental Health Counselors',
  supervisorOccupationId: 'Licensed Mental Health Counselor Supervisors',
  supervisorSpecialtyId: '',
  preferredFormat: 'virtual',
  stateOfLicensure: ['CA'],
  stateTheyAreLookingIn: ['CA'],
  howSoon: 'IMMEDIATELY',
  howSoonDate: '',
  availability: 'FLEXIBLE',
  feeType: 'per-session',
  budgetRange: '$0 - $50',
}

describe('supervisee step 2 schema (moved profile fields)', () => {
  it('accepts complete step 2 values including moved fields', () => {
    expect(superviseeStep2Schema.safeParse(validStep2Values).success).toBe(true)
  })

  it.each(['title', 'occupationId', 'typeOfSupervisor', 'supervisorOccupationId'] as const)(
    'requires %s on step 2',
    (field) => {
      const result = superviseeStep2Schema.safeParse({ ...validStep2Values, [field]: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.map((i) => i.path[0])).toContain(field)
      }
    },
  )

  it('requires a date when howSoon is CUSTOM_DATE', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      howSoon: 'CUSTOM_DATE',
      howSoonDate: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('Medical Director checkbox (needsMedicalDirector)', () => {
  it('defaults to unchecked', () => {
    const parsed = superviseeStep2Schema.safeParse(validStep2Values)
    expect(parsed.success && parsed.data.needsMedicalDirector).toBe(false)
  })

  it('allows a Medical Director-only request — no supervision type or occupation', () => {
    expect(
      superviseeStep2Schema.safeParse({
        ...validStep2Values,
        typeOfSupervisor: '',
        supervisorOccupationId: '',
        needsMedicalDirector: true,
      }).success,
    ).toBe(true)
  })

  it('can be combined with a supervision type', () => {
    expect(
      superviseeStep2Schema.safeParse({ ...validStep2Values, needsMedicalDirector: true }).success,
    ).toBe(true)
  })

  it('still requires the occupation cascade when a type is selected alongside it', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      supervisorOccupationId: '',
      needsMedicalDirector: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain('supervisorOccupationId')
    }
  })
})

describe('supervisee step 3 schema (profile fields removed)', () => {
  it('no longer validates the moved fields', () => {
    const shape = Object.keys(superviseeStep3Schema.shape)
    expect(shape).not.toContain('title')
    expect(shape).not.toContain('occupationId')
    expect(shape).not.toContain('specialtyId')
    expect(shape).toEqual(expect.arrayContaining(['description', 'agreedToPost', 'agreedToTerms']))
  })

  it('passes without the moved fields', () => {
    expect(
      superviseeStep3Schema.safeParse({
        description: 'Looking for a supportive supervisor with CBT experience.',
        agreedToPost: true,
        agreedToTerms: true,
      }).success,
    ).toBe(true)
  })
})

describe('step field lists', () => {
  it('lists the moved fields under step 2, not step 3', () => {
    const [, step2Fields, step3Fields] = SUPERVISEE_SIGNUP_STEP_FIELDS
    expect(step2Fields).toEqual(
      expect.arrayContaining(['title', 'occupationId', 'specialtyId', 'typeOfSupervisor']),
    )
    expect(step3Fields).not.toEqual(expect.arrayContaining(['title']))
    expect(step3Fields).not.toEqual(expect.arrayContaining(['occupationId']))
  })

  it('places eligibility fields before Type of Supervision Needed', () => {
    const step2Fields = SUPERVISEE_SIGNUP_STEP_FIELDS[1] as readonly string[]
    const typeIndex = step2Fields.indexOf('typeOfSupervisor')
    expect(step2Fields.indexOf('title')).toBeLessThan(typeIndex)
    expect(step2Fields.indexOf('occupationId')).toBeLessThan(typeIndex)
    expect(step2Fields.indexOf('specialtyId')).toBeLessThan(typeIndex)
  })
})
