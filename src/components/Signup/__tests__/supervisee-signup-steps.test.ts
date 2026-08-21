import { describe, expect, it } from 'vitest'

import {
  SUPERVISEE_SIGNUP_STEP_FIELDS,
  SUPERVISEE_SIGNUP_STEP_META,
  SUPERVISEE_SIGNUP_STEP_SCHEMAS,
  superviseeStep2Schema,
  superviseeStep3Schema,
} from '@/components/Signup/schema'

const validStep2Values = {
  title: 'AMFT',
  licensureState: 'TX',
  occupationId: '12',
  specialtyId: '',
  typeOfSupervisor: 'Mental Health Counselors',
  supervisorOccupationId: 'Licensed Mental Health Counselor Supervisors',
  supervisorSpecialtyId: '',
  preferredFormat: 'virtual',
  stateOfLicensure: ['CA'],
  howSoon: 'IMMEDIATELY',
  howSoonDate: '',
  mdPreferredOccupationId: '',
  mdPreferredSpecialtyId: '',
  mdHowSoon: '',
  mdHowSoonDate: '',
  availability: 'FLEXIBLE',
  feeType: 'hourly',
  budgetRange: '$0 - $50',
  description: 'Looking for a supportive supervisor with CBT experience.',
  agreedToPost: true,
  agreedToTerms: true,
}

describe('supervisee step 2 schema (moved profile fields)', () => {
  it('accepts complete step 2 values including moved fields', () => {
    expect(superviseeStep2Schema.safeParse(validStep2Values).success).toBe(true)
  })

  it.each([
    'title',
    'licensureState',
    'occupationId',
    'typeOfSupervisor',
    'supervisorOccupationId',
  ] as const)('requires %s on step 2', (field) => {
    const result = superviseeStep2Schema.safeParse({ ...validStep2Values, [field]: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain(field)
    }
  })

  it('requires a date when howSoon is CUSTOM_DATE', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      howSoon: 'CUSTOM_DATE',
      howSoonDate: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('fee type and budget rules', () => {
  it('hourly requires a budget range from the dropdown', () => {
    const result = superviseeStep2Schema.safeParse({ ...validStep2Values, budgetRange: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain('budgetRange')
    }
  })

  it('monthly requires a typed monthly budget instead of the range', () => {
    const monthlyValues = { ...validStep2Values, feeType: 'monthly', budgetRange: '' }
    const missing = superviseeStep2Schema.safeParse(monthlyValues)
    expect(missing.success).toBe(false)
    if (!missing.success) {
      expect(missing.error.issues.map((i) => i.path[0])).toContain('monthlyBudget')
    }
    expect(superviseeStep2Schema.safeParse({ ...monthlyValues, monthlyBudget: 1500 }).success).toBe(
      true,
    )
  })

  it('rejects the removed per-session fee type', () => {
    expect(
      superviseeStep2Schema.safeParse({ ...validStep2Values, feeType: 'per-session' }).success,
    ).toBe(false)
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
        mdHowSoon: 'IMMEDIATELY',
        mdMonthlyBudget: 1200,
      }).success,
    ).toBe(true)
  })

  it('can be combined with a supervision type', () => {
    expect(
      superviseeStep2Schema.safeParse({
        ...validStep2Values,
        needsMedicalDirector: true,
        mdHowSoon: 'IMMEDIATELY',
        mdMonthlyBudget: 1200,
        mdIdealDescription: 'A collaborative medical director for our clinic.',
      }).success,
    ).toBe(true)
  })

  it('requires its own MD description only in the combined case', () => {
    const combined = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      needsMedicalDirector: true,
      mdHowSoon: 'IMMEDIATELY',
      mdMonthlyBudget: 1200,
    })
    expect(combined.success).toBe(false)
    if (!combined.success) {
      expect(combined.error.issues.map((i) => i.path[0])).toContain('mdIdealDescription')
    }
    // MD-only reuses the main description — no own MD description required
    expect(
      superviseeStep2Schema.safeParse({
        ...validStep2Values,
        typeOfSupervisor: '',
        supervisorOccupationId: '',
        needsMedicalDirector: true,
        mdHowSoon: 'IMMEDIATELY',
        mdMonthlyBudget: 1200,
      }).success,
    ).toBe(true)
  })

  it('still requires the occupation cascade when a type is selected alongside it', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      supervisorOccupationId: '',
      needsMedicalDirector: true,
      mdHowSoon: 'IMMEDIATELY',
      mdMonthlyBudget: 1200,
      mdIdealDescription: 'A collaborative medical director for our clinic.',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain('supervisorOccupationId')
    }
  })

  it('requires the MD block (how soon + monthly budget) once the checkbox is ticked', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      needsMedicalDirector: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('mdHowSoon')
      expect(paths).toContain('mdMonthlyBudget')
    }
  })

  it('requires a date when mdHowSoon is CUSTOM_DATE', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      needsMedicalDirector: true,
      mdHowSoon: 'CUSTOM_DATE',
      mdMonthlyBudget: 1200,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain('mdHowSoonDate')
    }
  })

  it('skips the supervision how-soon and budget for an MD-only request', () => {
    expect(
      superviseeStep2Schema.safeParse({
        ...validStep2Values,
        typeOfSupervisor: '',
        supervisorOccupationId: '',
        needsMedicalDirector: true,
        howSoon: '',
        feeType: 'hourly',
        budgetRange: '',
        mdHowSoon: 'IMMEDIATELY',
        mdMonthlyBudget: 1200,
      }).success,
    ).toBe(true)
  })
})

describe('three-step structure (Introduction & Terms split into step 3)', () => {
  it('has exactly three steps across schemas, fields, and meta', () => {
    expect(SUPERVISEE_SIGNUP_STEP_SCHEMAS).toHaveLength(3)
    expect(SUPERVISEE_SIGNUP_STEP_FIELDS).toHaveLength(3)
    expect(SUPERVISEE_SIGNUP_STEP_META).toHaveLength(3)
  })

  it('validates the description on step 2 and the terms on step 3', () => {
    const missingDescription = superviseeStep2Schema.safeParse({
      ...validStep2Values,
      description: '',
    })
    expect(missingDescription.success).toBe(false)
    if (!missingDescription.success) {
      expect(missingDescription.error.issues.map((i) => i.path[0])).toContain('description')
    }

    const missingTerms = superviseeStep3Schema.safeParse({
      introduction: '',
      agreedToPost: false,
      agreedToTerms: false,
    })
    expect(missingTerms.success).toBe(false)
    if (!missingTerms.success) {
      const paths = missingTerms.error.issues.map((i) => i.path[0])
      expect(paths).toContain('agreedToPost')
      expect(paths).toContain('agreedToTerms')
    }
  })

  it('accepts step 3 with the agreements checked (introduction optional)', () => {
    expect(
      superviseeStep3Schema.safeParse({
        introduction: '',
        agreedToPost: true,
        agreedToTerms: true,
      }).success,
    ).toBe(true)
  })
})

describe('step field lists', () => {
  it('lists profile fields under step 2 and intro/terms under step 3', () => {
    const [, step2Fields, step3Fields] = SUPERVISEE_SIGNUP_STEP_FIELDS
    expect(step2Fields).toEqual(
      expect.arrayContaining([
        'title',
        'occupationId',
        'specialtyId',
        'typeOfSupervisor',
        'description',
      ]),
    )
    expect(step3Fields).toEqual(
      expect.arrayContaining(['introduction', 'agreedToPost', 'agreedToTerms']),
    )
  })

  it('places eligibility fields before Type of Supervision Needed', () => {
    const step2Fields = SUPERVISEE_SIGNUP_STEP_FIELDS[1] as readonly string[]
    const typeIndex = step2Fields.indexOf('typeOfSupervisor')
    expect(step2Fields.indexOf('title')).toBeLessThan(typeIndex)
    expect(step2Fields.indexOf('occupationId')).toBeLessThan(typeIndex)
    expect(step2Fields.indexOf('specialtyId')).toBeLessThan(typeIndex)
  })
})
