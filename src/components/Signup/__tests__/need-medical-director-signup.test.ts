import { describe, expect, it } from 'vitest'

import { needMedicalDirectorDefaultValues, parseSignupRoleFromType } from '../helpers'
import { superviseeStep2Schema } from '../schema'

/** Valid step-2 values for the dedicated Medical Director flow — no supervision type;
 *  the MD need is described by the md* fields, not the supervision preferences. */
const validNeedMdStep2Values = {
  title: 'RN',
  licensureState: 'TX',
  occupationId: '42',
  specialtyId: '',
  typeOfSupervisor: '',
  needsMedicalDirector: true,
  supervisorOccupationId: '',
  supervisorSpecialtyId: '',
  mdPreferredOccupationId: '',
  mdPreferredSpecialtyId: '',
  preferredFormat: 'virtual',
  stateOfLicensure: ['TX'],
  howSoon: '',
  howSoonDate: '',
  mdHowSoon: 'IMMEDIATELY',
  mdHowSoonDate: '',
  availability: 'FLEXIBLE',
  feeType: 'hourly',
  budgetRange: '',
  mdMonthlyBudget: 1500,
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

  it('starts the MD preference block blank', () => {
    expect(needMedicalDirectorDefaultValues.mdPreferredOccupationId).toBe('')
    expect(needMedicalDirectorDefaultValues.mdHowSoon).toBe('')
    expect(needMedicalDirectorDefaultValues.mdMonthlyBudget).toBeUndefined()
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
        mdPreferredOccupationId: 'Medical Doctor',
        mdPreferredSpecialtyId: 'Family Medicine',
      }).success,
    ).toBe(true)
  })

  it('requires the MD how-soon and monthly budget', () => {
    const result = superviseeStep2Schema.safeParse({
      ...validNeedMdStep2Values,
      mdHowSoon: '',
      mdMonthlyBudget: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('mdHowSoon')
      expect(paths).toContain('mdMonthlyBudget')
    }
  })

  it('does not require the supervision how-soon or budget fields', () => {
    // howSoon/feeType/budgetRange stay blank in the fixture — already asserted
    // valid above; this documents that an MD-only signup skips them entirely.
    const result = superviseeStep2Schema.safeParse(validNeedMdStep2Values)
    expect(result.success).toBe(true)
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
