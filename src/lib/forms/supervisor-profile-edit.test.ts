import { describe, expect, it } from 'vitest'

import {
  getDefaultSupervisorProfileFormValues,
  supervisorProfileFormValuesToPayload,
} from '@/lib/forms/supervisor-profile-edit'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

function makeProfile(overrides: Partial<SupervisorProfileData> = {}): SupervisorProfileData {
  return {
    id: 'profile-1',
    userId: 'user-1',
    licenseType: 'LPC',
    profession: null,
    licenseNumber: '12345',
    stateLicense: null,
    yearsOfExperience: '5 – 10 years',
    supervisionFormat: 'VIRTUAL',
    availability: 'FLEXIBLE',
    acceptingSupervisees: true,
    supervisionFeeType: 'HOURLY',
    supervisionFeeAmount: 100,
    verificationStatus: 'APPROVED',
    visibilityStatus: 'VISIBLE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    user: {
      id: 'user-1',
      email: 'jane@example.com',
      fullName: 'Jane Smith',
      city: 'Birmingham',
      state: 'AL',
      stateOfLicensure: ['AL'],
      profilePhotoUrl: null,
      emailVerified: true,
      subscriptions: [],
    },
    ...overrides,
  }
}

describe('professionalCredentials — edit supervisor profile form', () => {
  it('loads stored credentials into the form defaults', () => {
    const values = getDefaultSupervisorProfileFormValues(
      makeProfile({ professionalCredentials: 'Ph.D., NCC, LPC-S (AL)' }),
    )
    expect(values.professionalCredentials).toBe('Ph.D., NCC, LPC-S (AL)')
  })

  it('defaults to an empty string for legacy records (null/undefined)', () => {
    expect(
      getDefaultSupervisorProfileFormValues(makeProfile({ professionalCredentials: null }))
        .professionalCredentials,
    ).toBe('')
    expect(getDefaultSupervisorProfileFormValues(makeProfile()).professionalCredentials).toBe('')
  })

  it('sends trimmed credentials in the update payload', () => {
    const defaults = getDefaultSupervisorProfileFormValues(makeProfile())
    const payload = supervisorProfileFormValuesToPayload({
      ...defaults,
      // Defaults type the fee as optional (profiles may have none yet); the payload
      // function takes validated form values, so pin the fee the profile provides.
      supervisionFeeAmount: defaults.supervisionFeeAmount ?? 0,
      professionalCredentials: '  Psy.D., ABPP  ',
    })
    expect(payload.professionalCredentials).toBe('Psy.D., ABPP')
  })

  it('sends an empty string so clearing the field clears the stored value', () => {
    const defaults = getDefaultSupervisorProfileFormValues(
      makeProfile({ professionalCredentials: 'Ph.D.' }),
    )
    const payload = supervisorProfileFormValuesToPayload({
      ...defaults,
      supervisionFeeAmount: defaults.supervisionFeeAmount ?? 0,
      professionalCredentials: '',
    })
    expect(payload.professionalCredentials).toBe('')
  })
})
