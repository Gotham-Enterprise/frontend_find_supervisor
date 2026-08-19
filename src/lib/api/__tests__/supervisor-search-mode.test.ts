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
  })
})

describe('mapApiRowToSupervisorSearchResult — role label per mode', () => {
  const mdWithOffering: SupervisorSearchApiRow = {
    id: '1',
    fullName: 'Dr Offering MD',
    supervisorType: 'Medical Director',
    offerings: [{ supervisorType: 'Supervising Physician' }],
  }

  it('shows only the offering role in supervisors mode for a Medical Director', () => {
    const result = mapApiRowToSupervisorSearchResult(mdWithOffering, 0, 'supervisors')
    expect(result.supervisorType).toBe('Supervising Physician')
  })

  it('falls back to Medical Director in supervisors mode when there are no offerings', () => {
    const result = mapApiRowToSupervisorSearchResult(
      { id: '2', fullName: 'Dr Plain MD', supervisorType: 'Medical Director' },
      0,
      'supervisors',
    )
    expect(result.supervisorType).toBe('Medical Director')
  })

  it('keeps the combined label in medical-directors mode', () => {
    const result = mapApiRowToSupervisorSearchResult(mdWithOffering, 0, 'medical-directors')
    expect(result.supervisorType).toBe('Medical Director · Supervising Physician')
  })

  it('keeps the combined label when no mode is given (legacy callers)', () => {
    const result = mapApiRowToSupervisorSearchResult(mdWithOffering, 0)
    expect(result.supervisorType).toBe('Medical Director · Supervising Physician')
  })

  it('leaves non-Medical-Director rows unchanged in supervisors mode', () => {
    const result = mapApiRowToSupervisorSearchResult(
      { id: '3', fullName: 'Jane LCSW', supervisorType: 'Mental Health Counselors' },
      0,
      'supervisors',
    )
    expect(result.supervisorType).toBe('Mental Health Counselors')
  })
})
