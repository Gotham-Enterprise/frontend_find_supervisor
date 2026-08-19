import { describe, expect, it } from 'vitest'

import { needMedicalDirectorDefaultValues, parseSignupRoleFromType } from '../helpers'
import { superviseeStep2Schema } from '../schema'

/** Valid step-2 values for the dedicated Medical Director flow — no supervision type. */
const validNeedMdStep2Values = {
  title: 'RN',
  licensureState: 'TX',
  occupationId: '42',
  specialtyId: '',
  typeOfSupervisor: '',
  needsMedicalDirector: true,
  supervisorOccupationId: '',
  supervisorSpecialtyId: '',
  preferredFormat: 'virtual',
  stateOfLicensure: ['TX'],
  howSoon: 'IMMEDIATELY',
  howSoonDate: '',
  availability: 'FLEXIBLE',
  feeType: 'monthly',
  budgetRange: '',
  monthlyBudget: 1500,
  description: 'Med spa owner looking for a medical director for oversight.',
  agreedToPost: true,
  agreedToTerms: true,
}

describe('parseSignupRoleFromType — need-medical-director', () => {
  it('parses the need-medical-director query param', () => {
    expect(parseSignupRoleFromType('need-medical-director')).toBe('need-medical-director')
  })

  it('keeps the existing mappings', () => {
    expect(parseSignupRoleFromType('supervisee')).toBe('supervisee')
    expect(parseSignupRoleFromType('medical-director')).toBe('medical-director')
    expect(parseSignupRoleFromType('garbage')).toBe('supervisor')
    expect(parseSignupRoleFromType(null)).toBe('supervisor')
  })
})

describe('needMedicalDirectorDefaultValues', () => {
  it('presets the Medical Director need with everything else blank', () => {
    expect(needMedicalDirectorDefaultValues.needsMedicalDirector).toBe(true)
    expect(needMedicalDirectorDefaultValues.typeOfSupervisor).toBe('')
    expect(needMedicalDirectorDefaultValues.supervisorOccupationId).toBe('')
    expect(needMedicalDirectorDefaultValues.supervisorSpecialtyId).toBe('')
  })
})

describe('superviseeStep2Schema — dedicated Medical Director flow', () => {
  it('passes with no supervision type and no preferences', () => {
    expect(superviseeStep2Schema.safeParse(validNeedMdStep2Values).success).toBe(true)
  })

  it('passes with optional Medical Director preferences set', () => {
    expect(
      superviseeStep2Schema.safeParse({
        ...validNeedMdStep2Values,
        supervisorOccupationId: 'Medical Doctor',
        supervisorSpecialtyId: 'Family Medicine',
      }).success,
    ).toBe(true)
  })

  it('still fails without needsMedicalDirector when no type is selected (regression)', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validNeedMdStep2Values,
      needsMedicalDirector: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain('typeOfSupervisor')
    }
  })
})
