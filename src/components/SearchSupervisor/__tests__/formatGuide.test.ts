import { describe, expect, it } from 'vitest'

import {
  getFormatStatuses,
  getProfessionGroupForOccupation,
  getStateSupervisionRule,
  STATE_SUPERVISION_RULES,
} from '@/lib/constants/state-supervision-rules'
import { SUPERVISEE_ALLOWED_OCCUPATIONS } from '@/lib/utils/supervisee-eligibility'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import { resolveStateGuideTarget } from '../helpers'

function makeProfile(overrides: {
  occupation?: string | null
  licensureState?: string | null
  stateOfLicensure?: string[]
}): SuperviseeProfileData {
  const occupation = overrides.occupation ? { id: 1, name: overrides.occupation } : null
  return {
    licensureState: overrides.licensureState ?? null,
    occupation,
    user: { stateOfLicensure: overrides.stateOfLicensure ?? [], occupation },
  } as unknown as SuperviseeProfileData
}

describe('getProfessionGroupForOccupation', () => {
  it('maps supervisee occupations to profession groups', () => {
    expect(getProfessionGroupForOccupation('Licensed Professional Counselor Associate')).toBe(
      'COUNSELING',
    )
    expect(getProfessionGroupForOccupation('associate marriage and family therapist ')).toBe('MFT')
    expect(getProfessionGroupForOccupation('Licensed Master Social Worker')).toBe('SOCIAL_WORK')
    expect(getProfessionGroupForOccupation('Psychologist Intern')).toBe('PSYCHOLOGY')
  })

  it('returns null for professions not covered yet', () => {
    expect(getProfessionGroupForOccupation('Nurse Practitioner')).toBeNull()
    expect(getProfessionGroupForOccupation(null)).toBeNull()
  })

  it('covers every mental health occupation on the allowlist', () => {
    const uncovered = SUPERVISEE_ALLOWED_OCCUPATIONS.filter(
      (name) =>
        !['Nurse Practitioner', 'Physician Assistant'].includes(name) &&
        !getProfessionGroupForOccupation(name),
    )
    expect(uncovered).toEqual([])
  })
})

describe('getFormatStatuses', () => {
  it('treats hybrid as allowed when virtual is limited', () => {
    const fl = getStateSupervisionRule('FL', 'COUNSELING')!
    expect(getFormatStatuses(fl)).toEqual({
      inPerson: 'ALLOWED',
      hybrid: 'ALLOWED',
      remote: 'LIMITED',
    })
  })

  it('carries not-specified through to hybrid', () => {
    const tx = getStateSupervisionRule('tx', 'COUNSELING')!
    expect(getFormatStatuses(tx).hybrid).toBe('NOT_SPECIFIED')
  })
})

describe('STATE_SUPERVISION_RULES', () => {
  it('has one entry per state and profession, each with a source', () => {
    const keys = STATE_SUPERVISION_RULES.map((r) => `${r.state}:${r.profession}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const rule of STATE_SUPERVISION_RULES) {
      expect(rule.sourceUrl).toMatch(/^https:\/\//)
      expect(rule.citation).not.toBe('')
      expect(rule.remoteStatus === 'LIMITED').toBe(rule.remoteLimit !== null)
    }
  })
})

describe('resolveStateGuideTarget', () => {
  it('uses the supervisee licensure state and profession', () => {
    const profile = makeProfile({
      occupation: 'Associate Clinical Social Worker',
      licensureState: 'ca',
    })
    expect(resolveStateGuideTarget(profile, [])).toEqual({
      state: 'CA',
      profession: 'SOCIAL_WORK',
      physicianRole: null,
    })
  })

  it('prefers a single State License filter over the profile state', () => {
    const profile = makeProfile({
      occupation: 'Associate Clinical Social Worker',
      licensureState: 'CA',
    })
    expect(resolveStateGuideTarget(profile, ['NY'])?.state).toBe('NY')
    expect(resolveStateGuideTarget(profile, ['NY', 'TX'])?.state).toBe('CA')
  })

  it('falls back to the first user state of licensure', () => {
    const profile = makeProfile({ stateOfLicensure: ['FL', 'GA'] })
    expect(resolveStateGuideTarget(profile, [])).toEqual({
      state: 'FL',
      profession: null,
      physicianRole: null,
    })
  })

  it('targets the physician guide for NPs and PAs', () => {
    const np = makeProfile({ occupation: 'Nurse Practitioner', licensureState: 'TX' })
    expect(resolveStateGuideTarget(np, [])).toEqual({
      state: 'TX',
      profession: null,
      physicianRole: 'NP',
    })
    const pa = makeProfile({ occupation: 'Physician Assistant', licensureState: 'IL' })
    expect(resolveStateGuideTarget(pa, [])?.physicianRole).toBe('PA')
  })

  it('hides for uncovered occupations or when no state is known', () => {
    expect(
      resolveStateGuideTarget(makeProfile({ occupation: 'Dentist', licensureState: 'TX' }), []),
    ).toBeNull()
    expect(
      resolveStateGuideTarget(makeProfile({ occupation: 'Licensed Master Social Worker' }), []),
    ).toBeNull()
    expect(resolveStateGuideTarget(undefined, ['TX'])).toBeNull()
  })
})
