import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fetchPublicSupervisors,
  isPublicMedicalDirector,
  publicDirectoryFor,
  publicSupervisorProfilePath,
} from '@/lib/api/public-supervisors'

function mockSearchResponse(rows: unknown[]) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: rows, metaData: { totalCount: rows.length } }),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchPublicSupervisors — searchMode', () => {
  it('omits searchMode by default (legacy mixed listing)', async () => {
    const fetchMock = mockSearchResponse([])
    await fetchPublicSupervisors({ limit: 3 })
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.searchParams.has('searchMode')).toBe(false)
  })

  it('forwards the directory scope to the search endpoint', async () => {
    const fetchMock = mockSearchResponse([])
    await fetchPublicSupervisors({ searchMode: 'medicalDirectors' })
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.searchParams.get('searchMode')).toBe('medicalDirectors')
    expect(url.searchParams.get('acceptingSupervisees')).toBe('true')
  })

  it('parses Medical Director offerings and board certifications', async () => {
    mockSearchResponse([
      {
        id: 'md-1',
        fullName: 'Jane D',
        supervisorType: 'Medical Director',
        offerings: [
          {
            supervisorType: 'Supervising Physician',
            specialty: 'Dermatology',
            licenses: [{ state: 'TX' }, { state: '' }],
          },
          { supervisorType: '' },
        ],
        boardCertifications: [
          {
            certifyingBoard: 'American Board of Dermatology',
            specialty: 'Dermatology',
            certificationNumber: '',
            expirationDate: '2030-01-01T00:00:00.000Z',
          },
        ],
      },
    ])

    const { supervisors } = await fetchPublicSupervisors({ searchMode: 'medicalDirectors' })
    expect(supervisors[0].offerings).toEqual([
      {
        supervisorType: 'Supervising Physician',
        occupation: '',
        specialty: 'Dermatology',
        degreeType: '',
        licenseStates: ['TX'],
      },
    ])
    expect(supervisors[0].boardCertifications).toEqual([
      {
        certifyingBoard: 'American Board of Dermatology',
        specialty: 'Dermatology',
        subspecialty: '',
        expirationDate: '2030-01-01T00:00:00.000Z',
      },
    ])
  })

  it('defaults offerings and board certifications to [] for supervisors', async () => {
    mockSearchResponse([
      { id: 's-1', fullName: 'Sam S', supervisorType: 'Mental Health Counselors' },
    ])
    const { supervisors } = await fetchPublicSupervisors()
    expect(supervisors[0].offerings).toEqual([])
    expect(supervisors[0].boardCertifications).toEqual([])
  })
})

describe('public directory routing', () => {
  it('detects primary Medical Directors by name or legacy enum code', () => {
    expect(isPublicMedicalDirector({ supervisorType: 'Medical Director' })).toBe(true)
    expect(isPublicMedicalDirector({ supervisorType: 'MEDICAL_DIRECTOR' })).toBe(true)
    expect(isPublicMedicalDirector({ supervisorType: 'Supervising Physician' })).toBe(false)
    expect(isPublicMedicalDirector({ supervisorType: '' })).toBe(false)
  })

  it('routes each profile to its primary-type directory', () => {
    expect(publicDirectoryFor({ supervisorType: 'Medical Director' })).toBe('/medical-directors')
    expect(publicDirectoryFor({ supervisorType: 'Collaborating Physician' })).toBe('/supervisors')
  })

  it('builds the canonical profile path, falling back to the resolver without a state', () => {
    const md = { id: 'abc', state: 'TX', supervisorType: 'Medical Director' }
    expect(publicSupervisorProfilePath(md)).toBe('/medical-directors/texas/abc')
    expect(publicSupervisorProfilePath(md, 'california')).toBe('/medical-directors/california/abc')
    expect(publicSupervisorProfilePath({ ...md, state: '' })).toBe('/medical-directors/profile/abc')
    expect(
      publicSupervisorProfilePath({
        id: 'xyz',
        state: 'NY',
        supervisorType: 'Mental Health Counselors',
      }),
    ).toBe('/supervisors/new-york/xyz')
  })
})
