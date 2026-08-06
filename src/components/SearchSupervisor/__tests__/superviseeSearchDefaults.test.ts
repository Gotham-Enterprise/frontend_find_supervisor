import { describe, expect, it } from 'vitest'

import type { SupervisorTypeData } from '@/lib/api/options'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import { DEFAULT_FILTERS } from '../helpers'
import { mergeSuperviseeProfileIntoSearchFilters } from '../superviseeSearchDefaults'

const supervisorTypesData: SupervisorTypeData[] = [
  {
    id: '1',
    code: 'MENTAL_HEALTH_COUNSELORS',
    name: 'Mental Health Counselors',
    occupations: [
      {
        id: 'o1',
        name: 'Licensed Mental Health Counselor Supervisors',
        specialties: [{ id: 's1', name: 'Eating Disorders' }],
        licenseTypes: [],
        degreeTypes: [],
      },
    ],
  },
] as unknown as SupervisorTypeData[]

const stateOptions = [
  { label: 'CA', value: 'CA' },
  { label: 'NY', value: 'NY' },
]
const availabilityOptions = [{ label: 'Weekdays', value: 'WEEKDAYS' }]

function makeProfile(overrides: Partial<SuperviseeProfileData> = {}): SuperviseeProfileData {
  return {
    superviseeOccupation: 'Licensed Mental Health Counselor Supervisors',
    superviseeSpecialty: 'Eating Disorders',
    stateTheyAreLookingIn: ['CA', 'NY'],
    preferredFormat: 'VIRTUAL',
    availability: 'WEEKDAYS',
    ...overrides,
  } as SuperviseeProfileData
}

describe('mergeSuperviseeProfileIntoSearchFilters', () => {
  it('prefills occupation, specialty, license states, format, and availability', () => {
    const merged = mergeSuperviseeProfileIntoSearchFilters(
      makeProfile(),
      DEFAULT_FILTERS,
      stateOptions,
      availabilityOptions,
      supervisorTypesData,
    )
    expect(merged.supervisorOccupations).toEqual(['Licensed Mental Health Counselor Supervisors'])
    expect(merged.supervisorSpecialties).toEqual(['Eating Disorders'])
    expect(merged.stateLicenses).toEqual(['CA', 'NY'])
    expect(merged.supervisionFormats).toEqual(['VIRTUAL'])
    expect(merged.availability).toEqual(['WEEKDAYS'])
  })

  it('skips values that do not match the loaded options', () => {
    const merged = mergeSuperviseeProfileIntoSearchFilters(
      makeProfile({
        superviseeOccupation: 'Unknown Occupation',
        superviseeSpecialty: 'Unknown Specialty',
        stateTheyAreLookingIn: ['ZZ'],
        availability: 'SOMETIMES',
      }),
      DEFAULT_FILTERS,
      stateOptions,
      availabilityOptions,
      supervisorTypesData,
    )
    expect(merged.supervisorOccupations).toEqual([])
    expect(merged.supervisorSpecialties).toEqual([])
    expect(merged.stateLicenses).toEqual([])
    expect(merged.availability).toEqual([])
  })

  it('handles a Medical Director-only profile with no occupation cascade', () => {
    const merged = mergeSuperviseeProfileIntoSearchFilters(
      makeProfile({ superviseeOccupation: null, superviseeSpecialty: null }),
      DEFAULT_FILTERS,
      stateOptions,
      availabilityOptions,
      supervisorTypesData,
    )
    expect(merged.supervisorOccupations).toEqual([])
    expect(merged.supervisorSpecialties).toEqual([])
    expect(merged.stateLicenses).toEqual(['CA', 'NY'])
  })

  it('returns untouched defaults when there is no profile', () => {
    const merged = mergeSuperviseeProfileIntoSearchFilters(
      null,
      DEFAULT_FILTERS,
      stateOptions,
      availabilityOptions,
      supervisorTypesData,
    )
    expect(merged).toEqual(DEFAULT_FILTERS)
  })
})
