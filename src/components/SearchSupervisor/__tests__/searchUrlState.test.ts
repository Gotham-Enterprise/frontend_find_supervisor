import { describe, expect, it } from 'vitest'

import { DEFAULT_FILTERS, RADIUS_DEFAULT } from '../helpers'
import { buildSearchUrlParams, parseSearchUrlState } from '../searchUrlState'
import type { SupervisorSearchFilters } from '../types'

const FULL_FILTERS: SupervisorSearchFilters = {
  supervisorOccupations: ['Licensed Mental Health Counselor Supervisors'],
  supervisorSpecialties: ['Eating Disorders', 'Physical Medicine & Rehabilitation'],
  licenseTypes: ['LMFT'],
  stateLicenses: ['CA', 'NY'],
  city: 'Sacramento',
  state: 'CA',
  radiusMiles: 50,
  supervisionFormats: ['VIRTUAL'],
  yearsExperience: ['5 – 10 years'],
  patientPopulation: ['ADULTS'],
  acceptingOnly: false,
  availability: ['WEEKDAYS'],
}

describe('search URL state round trip', () => {
  it('serializes and parses the full state back unchanged', () => {
    const params = buildSearchUrlParams({
      keyword: 'anxiety',
      filters: FULL_FILTERS,
      sortBy: 'most_reviewed',
      page: 3,
    })
    const parsed = parseSearchUrlState(new URLSearchParams(params.toString()))

    expect(parsed.hasState).toBe(true)
    expect(parsed.keyword).toBe('anxiety')
    expect(parsed.sortBy).toBe('most_reviewed')
    expect(parsed.page).toBe(3)
    expect(parsed.filters).toEqual(FULL_FILTERS)
  })

  it('writes no params for the default state', () => {
    const params = buildSearchUrlParams({
      keyword: '',
      filters: DEFAULT_FILTERS,
      sortBy: 'best_match',
      page: 1,
    })
    expect(params.toString()).toBe('')
  })

  it('reports hasState=false for an empty URL and returns defaults', () => {
    const parsed = parseSearchUrlState(new URLSearchParams(''))
    expect(parsed.hasState).toBe(false)
    expect(parsed.filters).toEqual(DEFAULT_FILTERS)
    expect(parsed.sortBy).toBe('best_match')
    expect(parsed.page).toBe(1)
  })

  it('falls back to defaults for invalid radius, sort, and page values', () => {
    const parsed = parseSearchUrlState(new URLSearchParams('r=9999&sort=bogus&page=-2'))
    expect(parsed.filters.radiusMiles).toBe(RADIUS_DEFAULT)
    expect(parsed.sortBy).toBe('best_match')
    expect(parsed.page).toBe(1)
    // Present-but-invalid params still count as URL state (skip profile prefill)
    expect(parsed.hasState).toBe(true)
  })

  it('preserves option values containing spaces and special characters', () => {
    const filters = { ...DEFAULT_FILTERS, supervisorSpecialties: ['Obstetrics and Gynaecology'] }
    const params = buildSearchUrlParams({ keyword: '', filters, sortBy: 'best_match', page: 1 })
    const parsed = parseSearchUrlState(new URLSearchParams(params.toString()))
    expect(parsed.filters.supervisorSpecialties).toEqual(['Obstetrics and Gynaecology'])
  })
})
