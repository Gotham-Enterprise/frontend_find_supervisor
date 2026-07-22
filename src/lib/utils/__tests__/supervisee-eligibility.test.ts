import { describe, expect, it } from 'vitest'

import type { SupervisorTypeData } from '@/lib/api/options'
import {
  getEligibleSupervisorTypes,
  hasCompletedEligibilityFields,
  isSupervisorTypeEligibleForSupervisee,
  reconcileSelectedSupervisorType,
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

const nursePractitioner = { occupationName: 'Nurse Practitioner', credentialTitle: 'FNP' }
const physicianAssistant = { occupationName: 'Physician Assistant', credentialTitle: 'PA-C' }
const associateTherapist = { occupationName: 'Therapist', credentialTitle: 'AMFT' }
const unlicensedHirer = { occupationName: 'Practice Manager', credentialTitle: 'None' }

describe('Nurse Practitioner eligibility', () => {
  it('allows Collaborating Physician for Nurse Practitioners', () => {
    expect(isSupervisorTypeEligibleForSupervisee(collaboratingPhysician, nursePractitioner)).toBe(
      true,
    )
  })

  it('matches NP by credential title when occupation is generic', () => {
    expect(
      isSupervisorTypeEligibleForSupervisee(collaboratingPhysician, {
        occupationName: 'Nurse',
        credentialTitle: 'PMHNP',
      }),
    ).toBe(true)
  })

  it('denies Collaborating Physician for non-NPs', () => {
    expect(isSupervisorTypeEligibleForSupervisee(collaboratingPhysician, physicianAssistant)).toBe(
      false,
    )
    expect(isSupervisorTypeEligibleForSupervisee(collaboratingPhysician, associateTherapist)).toBe(
      false,
    )
  })
})

describe('Physician Assistant eligibility', () => {
  it('allows Supervising Physician for Physician Assistants', () => {
    expect(isSupervisorTypeEligibleForSupervisee(supervisingPhysician, physicianAssistant)).toBe(
      true,
    )
  })

  it('denies Supervising Physician for non-PAs', () => {
    expect(isSupervisorTypeEligibleForSupervisee(supervisingPhysician, nursePractitioner)).toBe(
      false,
    )
    expect(isSupervisorTypeEligibleForSupervisee(supervisingPhysician, associateTherapist)).toBe(
      false,
    )
  })
})

describe('Mental health supervisee eligibility', () => {
  it.each([
    'AMFT',
    'ACSW',
    'LSW',
    'APC',
    'LMHCA',
    'LPC-Associate',
    'Associate Psychologist',
    'LCMHCA',
    'LMFTA',
    'LAMFT',
    'MFTI',
    'RMFTI',
    'RMHCI',
    'MHC-LP',
    'LPC-IT',
    'LGPC',
    'LAPC',
    'LSWAIC',
    'LPA',
    'Psychological Assistant',
    'Postdoctoral Fellow',
  ])('allows Mental Health Counselors supervision for credential %s', (credentialTitle) => {
    expect(
      isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, {
        occupationName: 'Therapist',
        credentialTitle,
      }),
    ).toBe(true)
  })

  it('allows interns and limited permit holders', () => {
    expect(
      isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, {
        occupationName: 'Counselor',
        credentialTitle: 'Intern',
      }),
    ).toBe(true)
    expect(
      isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, {
        occupationName: 'Therapist',
        credentialTitle: 'Limited Permit Holder',
      }),
    ).toBe(true)
  })

  it('denies mental health supervision for NPs and PAs even when their title matches a generic phrase', () => {
    expect(
      isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, {
        occupationName: 'Physician Assistant',
        credentialTitle: 'Physician Associate',
      }),
    ).toBe(false)
    expect(
      isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, {
        occupationName: 'Nurse Practitioner',
        credentialTitle: 'APRN Intern',
      }),
    ).toBe(false)
  })

  it('denies mental health supervision for non-associate credentials', () => {
    expect(isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, nursePractitioner)).toBe(
      false,
    )
    expect(isSupervisorTypeEligibleForSupervisee(mentalHealthCounselors, unlicensedHirer)).toBe(
      false,
    )
  })
})

describe('Medical Director availability', () => {
  it('is always available, including for unlicensed hirers', () => {
    for (const ctx of [
      nursePractitioner,
      physicianAssistant,
      associateTherapist,
      unlicensedHirer,
    ]) {
      expect(isSupervisorTypeEligibleForSupervisee(medicalDirector, ctx)).toBe(true)
    }
  })

  it('is always present in the filtered option list', () => {
    for (const ctx of [
      nursePractitioner,
      physicianAssistant,
      associateTherapist,
      unlicensedHirer,
    ]) {
      const eligible = getEligibleSupervisorTypes(ALL_TYPES, ctx).map((t) => t.name)
      expect(eligible).toContain('Medical Director')
    }
  })
})

describe('getEligibleSupervisorTypes', () => {
  it('filters to the expected set per persona', () => {
    expect(getEligibleSupervisorTypes(ALL_TYPES, nursePractitioner).map((t) => t.name)).toEqual([
      'Collaborating Physician',
      'Medical Director',
    ])
    expect(getEligibleSupervisorTypes(ALL_TYPES, physicianAssistant).map((t) => t.name)).toEqual([
      'Supervising Physician',
      'Medical Director',
    ])
    expect(getEligibleSupervisorTypes(ALL_TYPES, associateTherapist).map((t) => t.name)).toEqual([
      'Mental Health Counselors',
      'Medical Director',
    ])
    expect(getEligibleSupervisorTypes(ALL_TYPES, unlicensedHirer).map((t) => t.name)).toEqual([
      'Medical Director',
    ])
  })

  it('defaults unknown/future types to available', () => {
    const future = makeType('FUTURE_TYPE', 'Future Type')
    expect(getEligibleSupervisorTypes([future], unlicensedHirer)).toHaveLength(1)
  })

  it('falls back to name matching when code is missing', () => {
    const noCode = { ...collaboratingPhysician, code: '' }
    expect(isSupervisorTypeEligibleForSupervisee(noCode, unlicensedHirer)).toBe(false)
    expect(isSupervisorTypeEligibleForSupervisee(noCode, nursePractitioner)).toBe(true)
  })
})

describe('reconcileSelectedSupervisorType', () => {
  it('clears a selection that became ineligible after an occupation change', () => {
    expect(
      reconcileSelectedSupervisorType('Collaborating Physician', ALL_TYPES, associateTherapist),
    ).toBe('')
  })

  it('keeps a selection that is still eligible', () => {
    expect(
      reconcileSelectedSupervisorType('Collaborating Physician', ALL_TYPES, nursePractitioner),
    ).toBe('Collaborating Physician')
    expect(reconcileSelectedSupervisorType('Medical Director', ALL_TYPES, unlicensedHirer)).toBe(
      'Medical Director',
    )
  })

  it('leaves empty and unknown selections alone', () => {
    expect(reconcileSelectedSupervisorType('', ALL_TYPES, unlicensedHirer)).toBe('')
    expect(reconcileSelectedSupervisorType('Not Loaded Yet', [], unlicensedHirer)).toBe(
      'Not Loaded Yet',
    )
  })
})

describe('hasCompletedEligibilityFields', () => {
  it('requires both credential title and occupation', () => {
    expect(hasCompletedEligibilityFields({ occupationName: '', credentialTitle: 'AMFT' })).toBe(
      false,
    )
    expect(
      hasCompletedEligibilityFields({ occupationName: 'Therapist', credentialTitle: ' ' }),
    ).toBe(false)
    expect(
      hasCompletedEligibilityFields({ occupationName: 'Therapist', credentialTitle: 'AMFT' }),
    ).toBe(true)
  })
})
