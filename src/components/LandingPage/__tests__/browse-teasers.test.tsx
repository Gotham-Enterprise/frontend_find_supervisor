import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PublicSuperviseeSearchResult } from '@/lib/api/public-supervisees'
import type { PublicSupervisorSearchResult } from '@/lib/api/public-supervisors'

import { assertPublicDataAvailable, BrowseTeasers } from '../browse-teasers'

vi.mock('@/lib/api/public-supervisors', () => ({ fetchPublicSupervisors: vi.fn() }))
vi.mock('@/lib/api/public-supervisees', () => ({ fetchPublicSupervisees: vi.fn() }))

const { fetchPublicSupervisors } = await import('@/lib/api/public-supervisors')
const { fetchPublicSupervisees } = await import('@/lib/api/public-supervisees')

const meta = { totalCount: 0, totalPages: 0, currentPage: 1, hasNextPage: false }

function supervisorResult(
  overrides: Partial<PublicSupervisorSearchResult> = {},
): PublicSupervisorSearchResult {
  return { ok: true, supervisors: [], meta, ...overrides }
}

function superviseeResult(
  overrides: Partial<PublicSuperviseeSearchResult> = {},
): PublicSuperviseeSearchResult {
  return { ok: true, supervisees: [], meta, ...overrides }
}

afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('assertPublicDataAvailable', () => {
  it('does nothing when every call succeeded', () => {
    expect(() =>
      assertPublicDataAvailable({ supervisors: true, supervisees: true }, 'production'),
    ).not.toThrow()
  })

  it('throws in production so a failed API call is never cached as a blank homepage', () => {
    expect(() =>
      assertPublicDataAvailable({ supervisors: false, supervisees: true }, 'production'),
    ).toThrow(/Public API unavailable for: supervisors/)
  })

  it('only warns outside production so local dev keeps working with the backend down', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      assertPublicDataAvailable({ supervisors: false, supervisees: false }, 'development'),
    ).not.toThrow()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('supervisors, supervisees'))
  })
})

describe('BrowseTeasers', () => {
  it('renders nothing when the API answered with zero rows everywhere', async () => {
    vi.mocked(fetchPublicSupervisors).mockResolvedValue(supervisorResult())
    vi.mocked(fetchPublicSupervisees).mockResolvedValue(superviseeResult())

    const { container } = render(await BrowseTeasers())

    expect(container).toBeEmptyDOMElement()
  })

  it('hides only the blocks with no rows and shows the rest', async () => {
    vi.mocked(fetchPublicSupervisors).mockResolvedValue(supervisorResult())
    vi.mocked(fetchPublicSupervisees).mockResolvedValue(
      superviseeResult({
        supervisees: [
          {
            id: 'sup-1',
            fullName: 'Jane D',
            location: 'Austin, TX',
            city: 'Austin',
            state: 'TX',
            profilePhotoUrl: '',
            occupation: 'Counselor',
            specialty: '',
            title: '',
            preferredFormat: 'VIRTUAL',
            howSoonLooking: '',
            typeOfSupervisorNeeded: [],
            stateOfLicensure: ['TX'],
            idealSupervisor: '',
            budgetRangeType: '',
            budgetRangeStart: 0,
            budgetRangeEnd: 0,
          } as unknown as PublicSuperviseeSearchResult['supervisees'][number],
        ],
      }),
    )

    render(await BrowseTeasers())

    expect(
      screen.getByRole('heading', { name: 'Supervisees Looking for Supervision' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Featured Supervisors' })).not.toBeInTheDocument()
  })

  it('throws in production when any public API call failed', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.mocked(fetchPublicSupervisors).mockResolvedValue(supervisorResult({ ok: false }))
    vi.mocked(fetchPublicSupervisees).mockResolvedValue(superviseeResult())

    await expect(BrowseTeasers()).rejects.toThrow(/Public API unavailable/)
    vi.unstubAllEnvs()
  })
})
