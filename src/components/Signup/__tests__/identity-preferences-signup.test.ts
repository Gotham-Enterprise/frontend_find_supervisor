import { describe, expect, it } from 'vitest'

import { superviseeDefaultValues, supervisorSignupDefaultValues } from '@/components/Signup/helpers'
import {
  MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS,
  SUPERVISEE_SIGNUP_STEP_FIELDS,
  type SuperviseeFormValues,
  superviseeStep1Schema,
  SUPERVISOR_SIGNUP_STEP_FIELDS,
  type SupervisorFormValues,
  supervisorStep1Schema,
} from '@/components/Signup/schema'
import { findFirstStepWithError } from '@/components/Signup/SupervisorSignupForm/applyZodIssuesToForm'
import { buildSuperviseeFormData, buildSupervisorFormData } from '@/lib/api/signup'
import { GENDER_IDENTITY_SELF_DESCRIBE, PRONOUN_VALUES } from '@/lib/constants/identity-preferences'
import { IDENTITY_PREFERENCE_FIELD_NAMES } from '@/lib/forms/identity-preferences'

const photo = new File(['x'], 'photo.png', { type: 'image/png' })

/** Valid Account step (step 1) for both roles — identity fields left at their blank defaults. */
const accountStep = {
  uploadProfilePhoto: photo,
  fullName: 'Taylor Cruz',
  email: 'taylor@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  contactNumber: '(415) 555-2671',
  city: 'San Francisco',
  state: 'CA',
  zipcode: '94105',
}

const supervisorStep1 = { ...supervisorSignupDefaultValues, ...accountStep }
const superviseeStep1 = { ...superviseeDefaultValues, ...accountStep }

describe('identity preferences — signup Account step', () => {
  it('registers with every identity field empty (no regression for users who skip the block)', () => {
    expect(supervisorStep1Schema.safeParse(supervisorStep1).success).toBe(true)
    expect(superviseeStep1Schema.safeParse(superviseeStep1).success).toBe(true)
  })

  it.each([
    ['a single pronoun', [PRONOUN_VALUES[1]]],
    ['multiple pronouns', [PRONOUN_VALUES[0], PRONOUN_VALUES[1]]],
    ['all pronouns', [...PRONOUN_VALUES]],
  ])('accepts %s on both roles', (_label, pronouns) => {
    expect(supervisorStep1Schema.safeParse({ ...supervisorStep1, pronouns }).success).toBe(true)
    expect(superviseeStep1Schema.safeParse({ ...superviseeStep1, pronouns }).success).toBe(true)
  })

  it('accepts a custom gender identity and multiple languages', () => {
    const values = {
      ...superviseeStep1,
      genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
      customGenderIdentity: 'Genderfluid',
      showGenderIdentity: true,
      languages: ['en', 'es', 'tl'],
      showLanguages: true,
    }
    expect(superviseeStep1Schema.safeParse(values).success).toBe(true)
  })

  it('blocks step 1 when "Prefer to self-describe" has no text, on both roles', () => {
    for (const [schema, base] of [
      [supervisorStep1Schema, supervisorStep1],
      [superviseeStep1Schema, superviseeStep1],
    ] as const) {
      const result = schema.safeParse({
        ...base,
        genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
        customGenderIdentity: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual([
          'customGenderIdentity',
        ])
      }
    }
  })

  it('routes identity errors back to the Account step in every signup variant', () => {
    for (const stepFields of [
      SUPERVISOR_SIGNUP_STEP_FIELDS,
      MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS,
      SUPERVISEE_SIGNUP_STEP_FIELDS,
    ]) {
      for (const name of IDENTITY_PREFERENCE_FIELD_NAMES) {
        expect(stepFields[0]).toContain(name)
        expect(findFirstStepWithError([name], stepFields)).toBe(0)
      }
    }
  })
})

describe('identity preferences — registration payloads', () => {
  const identity = {
    pronouns: ['HE_HIM_HIS', 'THEY_THEM_THEIRS'],
    showPronouns: true,
    genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
    customGenderIdentity: 'Agender',
    showGenderIdentity: false,
    languages: ['en', 'ko'],
    showLanguages: true,
  }

  it('sends the block with the supervisor registration', () => {
    const fd = buildSupervisorFormData({
      ...supervisorStep1,
      ...identity,
      licenses: [
        { licenseType: 'LPC', licenseNumber: 'A1', state: 'TX', licenseExpiration: '2099-01-01' },
      ],
      certifications: ['CBT'],
      supervisorFeeAmount: 100,
      supervisionFeeAmount: 100,
    } as unknown as SupervisorFormValues)
    expect(fd.get('pronouns')).toBe('["HE_HIM_HIS","THEY_THEM_THEIRS"]')
    expect(fd.get('showPronouns')).toBe('true')
    expect(fd.get('genderIdentity')).toBe(GENDER_IDENTITY_SELF_DESCRIBE)
    expect(fd.get('customGenderIdentity')).toBe('Agender')
    expect(fd.get('showGenderIdentity')).toBe('false')
    expect(fd.get('languages')).toBe('["en","ko"]')
    expect(fd.get('showLanguages')).toBe('true')
    // Existing account fields are untouched
    expect(fd.get('fullName')).toBe('Taylor Cruz')
    expect(fd.get('role')).toBe('SUPERVISOR')
  })

  it('sends the block with the supervisee registration and encodes an empty block explicitly', () => {
    const fd = buildSuperviseeFormData({
      ...superviseeStep1,
      stateOfLicensure: ['CA'],
    } as unknown as SuperviseeFormValues)
    expect(fd.get('pronouns')).toBe('[]')
    expect(fd.get('showPronouns')).toBe('false')
    expect(fd.get('genderIdentity')).toBe('')
    expect(fd.get('customGenderIdentity')).toBe('')
    expect(fd.get('showGenderIdentity')).toBe('false')
    expect(fd.get('languages')).toBe('[]')
    expect(fd.get('showLanguages')).toBe('false')
    expect(fd.get('role')).toBe('SUPERVISEE')
  })
})
