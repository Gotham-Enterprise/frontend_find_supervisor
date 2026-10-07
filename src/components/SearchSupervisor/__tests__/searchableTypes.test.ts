import { describe, expect, it } from 'vitest'

import type { SupervisorTypeData } from '@/lib/api/options'

import { getSearchableSupervisorTypes } from '../helpers'

const type = (code: string, name: string): SupervisorTypeData => ({
  id: code,
  code,
  name,
  occupations: [],
})

const TYPES = [
  type('MENTAL_HEALTH_COUNSELORS', 'Mental Health Counselors'),
  type('SUPERVISING_PHYSICIAN', 'Supervising Physician'),
  type('COLLABORATING_PHYSICIAN', 'Collaborating Physician'),
  type('MEDICAL_DIRECTOR', 'Medical Director'),
]

const codes = (types: SupervisorTypeData[]) => types.map((t) => t.code)

describe('getSearchableSupervisorTypes', () => {
  it('keeps only the needed types and drops Medical Director', () => {
    expect(
      codes(getSearchableSupervisorTypes(TYPES, ['Supervising Physician', 'Medical Director'])),
    ).toEqual(['SUPERVISING_PHYSICIAN'])
  })

  it('accepts legacy enum codes as needs', () => {
    expect(codes(getSearchableSupervisorTypes(TYPES, ['COLLABORATING_PHYSICIAN']))).toEqual([
      'COLLABORATING_PHYSICIAN',
    ])
  })

  it('falls back to every non-Medical-Director type when no need matches', () => {
    const all = ['MENTAL_HEALTH_COUNSELORS', 'SUPERVISING_PHYSICIAN', 'COLLABORATING_PHYSICIAN']
    expect(codes(getSearchableSupervisorTypes(TYPES, undefined))).toEqual(all)
    expect(codes(getSearchableSupervisorTypes(TYPES, ['LPC_SUPERVISOR']))).toEqual(all)
    expect(codes(getSearchableSupervisorTypes(TYPES, ['Medical Director']))).toEqual(all)
  })
})
