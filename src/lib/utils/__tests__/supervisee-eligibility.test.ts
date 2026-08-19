import { describe, expect, it } from 'vitest'

import type { SupervisorTypeData } from '@/lib/api/options'
import {
  filterSuperviseeOccupationOptions,
  getEligibleSupervisorTypes,
  hasCompletedEligibilityFields,
  isAllowedSuperviseeOccupation,
  isSupervisorTypeEligibleForSupervisee,
  reconcileSelectedSupervisorType,
  SUPERVISEE_ALLOWED_OCCUPATIONS,
} from '@/lib/utils/supervisee-eligibility'

function makeType(code: string, name: string): SupervisorTypeData {
  return { id: code.toLowerCase(), code, name, occupations: [] }
}

const collaboratingPhysician = makeType('COLLABORATING_PHYSICIAN', 'Collaborating Physician')
const supervisingPhysician = makeType('SUPERVISING_PHYSICIAN', 'Supervising Physician')
const mentalHealthCounselors = makeType('MENTAL_HEALTH_COUNSELORS', 'Mental Health Counselors')
const medicalDirector = makeType('MEDICAL_DIRECTOR', 'Medical Director')

const ALL_TYPES = [
  collaboratingPhysician,
  supervisingPhysician,
  mentalHealthCounselors,
  medicalDirector,
]

const MENTAL_HEALTH_OCCUPATIONS = SUPERVISEE_ALLOWED_OCCUPATIONS.filter(
  (name) => name !== 'Physician Assistant' && name !== 'Nurse Practitioner',
)

describe('Nurse Practitioner eligibility', () => {
  it('allows Collaborating Physician for the Nurse Practitioner occupation', () => {
    expect(
      isSupervisorTypeEligibleForSupervisee(collaboratingPhysician, 'Nurse Practitioner'),
    ).toBe(true)
  })

  it('denies Collaborating Physician for other occupations', () => {
    for (const occupation of ['Physician Assistant', 'Associate Marriage and Family Therapist']) {
      expect(isSupervisorTypeEligibleForSupervisee(collaboratingPhysician, occupation)).toBe(false)
    }
  })
})

describe('Physician Assistant eligibility', () => {
  it('allows Supervising Physician for the Physician Assistant occupation', () => {
    expect(isSupervisorTypeEligibleForSupervisee(supervisingPhysician, 'Physician Assistant')).toBe(
      true,
    )
  })

  it('denies Supervising Physician for other occupations', () => {
    for (const occupation of ['Nurse Practitioner', 'Associate Clinical Social Worker']) {
      expect(isSupervisorTypeEligibleForSupervisee(supervisingPhysician, occupation)).toBe(false)
    }
  })
})

describe('Mental Health Counselors eligibility (occupation-only)', () => {
  it.each(MENTAL_HEALTH_OCCUPATIONS)('allows the %s occupation', (occupationName) => {
    expect(isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, occupationName)).toBe(true)
  })

  it('denies NPs and PAs', () => {
    for (const occupation of ['Nurse Practitioner', 'Physician Assistant']) {
      expect(isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, occupation)).toBe(false)
    }
  })

  it('denies legacy licensed occupations (strict allowlist)', () => {
    for (const occupation of [
      'Mental Health Counselor',
      'Licensed Professional Counselor',
      'Licensed Marriage and Family Therapist',
      'Social Worker',
      'Psychologist',
      'Accountant',
      '',
    ]) {
      expect(isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, occupation)).toBe(false)
    }
  })
})

describe('Medical Director eligibility', () => {
  it('is available for every occupation', () => {
    for (const occupation of ['Nurse Practitioner', 'Accountant', '']) {
      expect(isSupervisorTypeEligibleForSupervisee(medicalDirector, occupation)).toBe(true)
    }
  })

  it('is excluded from getEligibleSupervisorTypes (requested via checkbox)', () => {
    const eligible = getEligibleSupervisorTypes(ALL_TYPES, 'Nurse Practitioner')
    expect(eligible.map((t) => t.code)).toEqual(['COLLABORATING_PHYSICIAN'])
  })
})

describe('type-code resolution fallbacks', () => {
  it('resolves by display name when the code is missing', () => {
    const noCode = { ...collaboratingPhysician, code: '' }
    expect(isSupervisorTypeEligibleForSupervisee(noCode, 'Accountant')).toBe(false)
    expect(isSupervisorTypeEligibleForSupervisee(noCode, 'Nurse Practitioner')).toBe(true)
  })
})

describe('reconcileSelectedSupervisorType', () => {
  it('clears a selection that became ineligible after an occupation change', () => {
    expect(
      reconcileSelectedSupervisorType(
        'Collaborating Physician',
        ALL_TYPES,
        'Associate Marriage and Family Therapist',
      ),
    ).toBe('')
  })

  it('keeps a selection that is still eligible', () => {
    expect(
      reconcileSelectedSupervisorType('Collaborating Physician', ALL_TYPES, 'Nurse Practitioner'),
    ).toBe('Collaborating Physician')
  })

  it('leaves empty and unknown selections alone', () => {
    expect(reconcileSelectedSupervisorType('', ALL_TYPES, 'Accountant')).toBe('')
    expect(reconcileSelectedSupervisorType('Not Loaded Yet', [], 'Accountant')).toBe(
      'Not Loaded Yet',
    )
  })
})

describe('supervisee occupation allowlist', () => {
  it('allows every occupation on the product allowlist', () => {
    for (const name of SUPERVISEE_ALLOWED_OCCUPATIONS) {
      expect(isAllowedSuperviseeOccupation(name)).toBe(true)
    }
  })

  it('is case- and whitespace-insensitive', () => {
    expect(isAllowedSuperviseeOccupation('  nurse practitioner ')).toBe(true)
    expect(isAllowedSuperviseeOccupation('ASSOCIATE MARRIAGE AND FAMILY THERAPIST')).toBe(true)
  })

  it('rejects occupations that are not supervisees, including licensed-level titles', () => {
    for (const name of [
      'Accountant',
      'Attorney',
      'Registered Nurse',
      'Physician',
      'Mental Health Counselor',
      'Licensed Professional Counselor',
      'Licensed Marriage and Family Therapist',
      'Social Worker',
      'Psychologist',
      '',
    ]) {
      expect(isAllowedSuperviseeOccupation(name)).toBe(false)
    }
  })

  it('filters dropdown options down to the allowlist', () => {
    const options = [
      { label: 'Accountant', value: '79' },
      { label: 'Psychologist', value: '114' },
      { label: 'Associate Marriage and Family Therapist', value: '159' },
      { label: 'Nurse Practitioner', value: '9' },
      { label: 'Attorney', value: '64' },
    ]
    expect(filterSuperviseeOccupationOptions(options).map((o) => o.label)).toEqual([
      'Associate Marriage and Family Therapist',
      'Nurse Practitioner',
    ])
  })

  it('keeps a legacy saved option via the keep predicate', () => {
    const options = [
      { label: 'Accountant', value: '79' },
      { label: 'Licensed Mental Health Counselor Associate', value: '161' },
    ]
    expect(
      filterSuperviseeOccupationOptions(options, (o) => o.value === '79').map((o) => o.label),
    ).toEqual(['Accountant', 'Licensed Mental Health Counselor Associate'])
  })

  it('every mental-health allowlist occupation qualifies for mental-health supervision', () => {
    for (const occupationName of MENTAL_HEALTH_OCCUPATIONS) {
      expect(isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, occupationName)).toBe(
        true,
      )
    }
  })
})

describe('hasCompletedEligibilityFields', () => {
  it('requires only the occupation', () => {
    expect(hasCompletedEligibilityFields('')).toBe(false)
    expect(hasCompletedEligibilityFields('   ')).toBe(false)
    expect(hasCompletedEligibilityFields('Associate Professional Counselor')).toBe(true)
  })
})
