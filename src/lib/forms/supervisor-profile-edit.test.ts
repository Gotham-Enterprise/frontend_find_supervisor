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

describe('Medical Director profile edit — offerings and board certifications', () => {
  const mdProfile = (overrides: Partial<SupervisorProfileData> = {}) =>
    makeProfile({
      supervisorType: 'Medical Director',
      degreeType: 'MD',
      supervisorOccupation: 'Medical Doctor',
      ...overrides,
    })

  it('maps stored offering rows to checkbox flags and keyed blocks', () => {
    const values = getDefaultSupervisorProfileFormValues(
      mdProfile({
        offerings: [
          {
            supervisorType: 'Supervising Physician',
            occupation: 'MD for Physician Assistants',
            specialty: 'Internal Medicine',
            degreeType: 'MD',
            licenses: [
              { licenseNumber: 'B456', state: 'TX', licenseExpiration: '2030-01-01T00:00:00.000Z' },
            ],
          },
        ],
      }),
    )
    expect(values.offerSupervisingPhysician).toBe(true)
    expect(values.offerCollaboratingPhysician).toBe(false)
    expect(values.offerings.supervising.occupation).toBe('MD for Physician Assistants')
    expect(values.offerings.supervising.licenses).toEqual([
      { licenseType: '', licenseNumber: 'B456', state: 'TX', licenseExpiration: '2030-01-01' },
    ])
  })

  it('defaults to unchecked offerings with blank blocks when none stored', () => {
    const values = getDefaultSupervisorProfileFormValues(mdProfile())
    expect(values.offerSupervisingPhysician).toBe(false)
    expect(values.offerCollaboratingPhysician).toBe(false)
    expect(values.offerings.supervising.licenses).toHaveLength(1)
  })

  it('maps stored board certifications, detecting non-ABMS boards as Other', () => {
    const values = getDefaultSupervisorProfileFormValues(
      mdProfile({
        boardCertifications: [
          {
            certifyingBoard: 'American Board of Internal Medicine',
            specialty: 'Internal Medicine',
            expirationDate: '2030-01-01T00:00:00.000Z',
          },
          {
            certifyingBoard: 'American Osteopathic Board of Family Physicians',
            specialty: 'Family Medicine',
          },
        ],
      }),
    )
    expect(values.boardCertified).toBe(true)
    expect(values.boardCertifications[0].certifyingBoard).toBe(
      'American Board of Internal Medicine',
    )
    expect(values.boardCertifications[0].certifyingBoardOther).toBe('')
    expect(values.boardCertifications[0].expirationDate).toBe('2030-01-01')
    expect(values.boardCertifications[1].certifyingBoard).toBe('Other')
    expect(values.boardCertifications[1].certifyingBoardOther).toBe(
      'American Osteopathic Board of Family Physicians',
    )
  })

  it('defaults Board Certified to No with one blank entry when none stored', () => {
    const values = getDefaultSupervisorProfileFormValues(mdProfile())
    expect(values.boardCertified).toBe(false)
    expect(values.boardCertifications).toHaveLength(1)
  })

  it('includes full-replace offerings and board certifications in the MD payload', () => {
    const defaults = getDefaultSupervisorProfileFormValues(
      mdProfile({
        offerings: [
          {
            supervisorType: 'Collaborating Physician',
            occupation: 'MD for Nurse Practitioners',
            degreeType: 'MD',
            licenses: [
              { licenseNumber: 'C789', state: 'TX', licenseExpiration: '2030-01-01T00:00:00.000Z' },
            ],
          },
        ],
        boardCertifications: [
          { certifyingBoard: 'American Board of Surgery', specialty: 'Surgery' },
        ],
      }),
    )
    const payload = supervisorProfileFormValuesToPayload({
      ...defaults,
      supervisionFeeAmount: defaults.supervisionFeeAmount ?? 0,
    })
    expect(payload.offerings).toEqual([
      {
        supervisorType: 'Collaborating Physician',
        occupation: 'MD for Nurse Practitioners',
        degreeType: 'MD',
        licenses: [{ licenseNumber: 'C789', state: 'TX', licenseExpiration: '2030-01-01' }],
      },
    ])
    expect(payload.boardCertifications).toEqual([
      { certifyingBoard: 'American Board of Surgery', specialty: 'Surgery' },
    ])
  })

  it('sends empty arrays for unchecked offerings / Board Certified No (clear-all)', () => {
    const defaults = getDefaultSupervisorProfileFormValues(mdProfile())
    const payload = supervisorProfileFormValuesToPayload({
      ...defaults,
      supervisionFeeAmount: defaults.supervisionFeeAmount ?? 0,
    })
    expect(payload.offerings).toEqual([])
    expect(payload.boardCertifications).toEqual([])
  })

  it('omits the MD fields entirely for non-Medical-Director profiles', () => {
    const defaults = getDefaultSupervisorProfileFormValues(
      makeProfile({ supervisorType: 'Mental Health Counselors' }),
    )
    const payload = supervisorProfileFormValuesToPayload({
      ...defaults,
      supervisionFeeAmount: defaults.supervisionFeeAmount ?? 0,
    })
    expect('offerings' in payload).toBe(false)
    expect('boardCertifications' in payload).toBe(false)
  })
})
