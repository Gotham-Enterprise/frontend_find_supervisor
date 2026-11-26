import { describe, expect, it } from 'vitest'

import { DEFAULT_FILTERS } from '@/components/SearchSupervisor/helpers'
import {
  buildSupervisorSearchParams,
  mapApiRowToSupervisorSearchResult,
  type SupervisorSearchApiRow,
} from '@/lib/api/supervisor-search'

const baseInput = {
  page: 1,
  limit: 10,
  keywords: '',
  filters: DEFAULT_FILTERS,
}

describe('buildSupervisorSearchParams — searchMode', () => {
  it('omits searchMode by default (public/pSEO callers keep the mixed behavior)', () => {
    expect('searchMode' in buildSupervisorSearchParams(baseInput)).toBe(false)
  })

  it('maps the page modes to the API values', () => {
    expect(
      buildSupervisorSearchParams({ ...baseInput, searchMode: 'supervisors' }).searchMode,
    ).toBe('supervisors')
    expect(
      buildSupervisorSearchParams({ ...baseInput, searchMode: 'medical-directors' }).searchMode,
    ).toBe('medicalDirectors')
    expect(buildSupervisorSearchParams({ ...baseInput, searchMode: 'preceptors' }).searchMode).toBe(
      'preceptors',
    )
  })

  it('keeps the weekly-hours filter on the preceptors page (only Medical Directors drop it)', () => {
    const filters = { ...DEFAULT_FILTERS, weeklyHoursAvailable: ['11_20'] }
    expect(
      buildSupervisorSearchParams({ ...baseInput, filters, searchMode: 'preceptors' })
        .weeklyHoursAvailable,
    ).toBe('11_20')
    expect(
      'weeklyHoursAvailable' in
        buildSupervisorSearchParams({ ...baseInput, filters, searchMode: 'medical-directors' }),
    ).toBe(false)
  })
})

describe('mapApiRowToSupervisorSearchResult — role label', () => {
  const mdWithOffering: SupervisorSearchApiRow = {
    id: '1',
    fullName: 'Dr Offering MD',
    supervisorType: 'Medical Director',
    offerings: [{ supervisorType: 'Supervising Physician' }],
  }

  it('shows every role for a Medical Director with an offering, primary first', () => {
    const result = mapApiRowToSupervisorSearchResult(mdWithOffering, 0)
    expect(result.supervisorType).toBe('Medical Director · Supervising Physician')
  })

  it('shows Medical Director alone when there are no offerings', () => {
    const result = mapApiRowToSupervisorSearchResult(
      { id: '2', fullName: 'Dr Plain MD', supervisorType: 'Medical Director' },
      0,
    )
    expect(result.supervisorType).toBe('Medical Director')
  })

  it('applies the supervisee-facing display override to non-Medical-Director rows', () => {
    const result = mapApiRowToSupervisorSearchResult(
      { id: '3', fullName: 'Jane LCSW', supervisorType: 'Mental Health Counselors' },
      0,
    )
    expect(result.supervisorType).toBe('Mental Health Counselor Supervisor')
  })
})
