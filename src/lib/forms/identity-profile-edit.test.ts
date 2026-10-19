import { describe, expect, it } from 'vitest'

import { GENDER_IDENTITY_SELF_DESCRIBE } from '@/lib/constants/identity-preferences'
import {
  editSuperviseeProfileSchema,
  getDefaultSuperviseeProfileFormValues,
  superviseeProfileFormValuesToPayload,
} from '@/lib/forms/supervisee-profile-edit'
import {
  getDefaultSupervisorProfileFormValues,
  supervisorProfileFormValuesToPayload,
} from '@/lib/forms/supervisor-profile-edit'
import type { UserIdentityPreferences } from '@/types/identity-preferences'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

const storedIdentity: UserIdentityPreferences = {
  pronouns: ['SHE_HER_HERS', 'THEY_THEM_THEIRS'],
  showPronouns: true,
  genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
  customGenderIdentity: 'Genderfluid',
  showGenderIdentity: false,
  languages: ['en', 'es'],
  showLanguages: true,
}

function makeSuperviseeProfile(): SuperviseeProfileData {
  return {
    id: 'profile-1',
    userId: 'user-1',
    typeOfSupervisorNeeded: ['Mental Health Counselors'],
    howSoonLooking: 'IMMEDIATELY',
    lookingDate: null,
    preferredFormat: 'VIRTUAL',
    title: 'AMFT',
    licensureState: 'TX',
    availability: 'FLEXIBLE',
    idealSupervisor: 'Supportive supervisor with CBT experience.',
    budgetRangeType: 'HOURLY',
    budgetRangeStart: 0,
    budgetRangeEnd: 100,
    completedCount: 0,
    leftCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    occupationId: 12,
    superviseeOccupation: 'Licensed Mental Health Counselor Supervisors',
    superviseeSpecialty: '',
    user: {
      id: 'user-1',
      email: 'sam@example.com',
      fullName: 'Sam Reyes',
      contactNumber: '(555) 123-4567',
      city: 'Sacramento',
      state: 'CA',
      zipcode: '95814',
      stateOfLicensure: ['CA'],
      profilePhotoUrl: null,
      emailVerified: true,
      subscriptions: [],
      ...storedIdentity,
    },
  }
}

/** Only the fields the supervisor default/payload mappers read. */
function makeSupervisorProfile(): SupervisorProfileData {
  return {
    id: 'profile-2',
    userId: 'user-2',
    licenseType: 'LPC',
    licenseNumber: 'A1',
    stateLicense: 'TX',
    supervisorType: 'Mental Health Counselors',
    yearsOfExperience: '5 – 10 years',
    supervisionFormat: 'VIRTUAL',
    availability: 'FLEXIBLE',
    acceptingSupervisees: true,
    supervisionFeeType: 'HOURLY',
    supervisionFeeAmount: 100,
    verificationStatus: 'APPROVED',
    visibilityStatus: 'VISIBLE',
    profession: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    user: {
      id: 'user-2',
      email: 'jo@example.com',
      fullName: 'Jo Lee',
      city: 'Austin',
      state: 'TX',
      stateOfLicensure: ['TX'],
      profilePhotoUrl: null,
      emailVerified: true,
      subscriptions: [],
      ...storedIdentity,
    },
  } as SupervisorProfileData
}

describe('identity preferences — supervisee profile edit round trip', () => {
  it('prefills the saved values and sends them back as the identity payload', () => {
    const values = getDefaultSuperviseeProfileFormValues(makeSuperviseeProfile())
    expect(values.pronouns).toEqual(['SHE_HER_HERS', 'THEY_THEM_THEIRS'])
    expect(values.showPronouns).toBe(true)
    expect(values.genderIdentity).toBe(GENDER_IDENTITY_SELF_DESCRIBE)
    expect(values.customGenderIdentity).toBe('Genderfluid')
    expect(values.showGenderIdentity).toBe(false)
    expect(values.languages).toEqual(['en', 'es'])
    expect(values.showLanguages).toBe(true)

    expect(editSuperviseeProfileSchema.safeParse(values).success).toBe(true)
    expect(superviseeProfileFormValuesToPayload(values).identity).toEqual(storedIdentity)
  })

  it('persists a cleared selection and toggled visibility', () => {
    const values = getDefaultSuperviseeProfileFormValues(makeSuperviseeProfile())
    const payload = superviseeProfileFormValuesToPayload({
      ...values,
      pronouns: [],
      showPronouns: false,
      genderIdentity: 'PREFER_NOT_TO_SAY',
      showGenderIdentity: true,
    })
    expect(payload.identity).toEqual({
      ...storedIdentity,
      pronouns: [],
      showPronouns: false,
      genderIdentity: 'PREFER_NOT_TO_SAY',
      customGenderIdentity: null,
      showGenderIdentity: true,
    })
  })

  it('rejects "Prefer to self-describe" without the written identity', () => {
    const values = getDefaultSuperviseeProfileFormValues(makeSuperviseeProfile())
    const result = editSuperviseeProfileSchema.safeParse({ ...values, customGenderIdentity: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'customGenderIdentity',
      )
    }
  })

  it('defaults to a blank block for a profile saved before the feature', () => {
    const profile = makeSuperviseeProfile()
    const legacyUser = { ...profile.user } as Record<string, unknown>
    for (const key of Object.keys(storedIdentity)) delete legacyUser[key]
    const values = getDefaultSuperviseeProfileFormValues({
      ...profile,
      user: legacyUser as unknown as SuperviseeProfileData['user'],
    })
    expect(values.pronouns).toEqual([])
    expect(values.genderIdentity).toBe('')
    expect(values.showPronouns).toBe(false)
    expect(values.showGenderIdentity).toBe(false)
    expect(values.showLanguages).toBe(false)
  })
})

describe('identity preferences — supervisor profile edit round trip', () => {
  it('prefills the saved values and sends them back as the identity payload', () => {
    const values = getDefaultSupervisorProfileFormValues(makeSupervisorProfile())
    expect(values.pronouns).toEqual(['SHE_HER_HERS', 'THEY_THEM_THEIRS'])
    expect(values.customGenderIdentity).toBe('Genderfluid')
    expect(values.languages).toEqual(['en', 'es'])
    expect(supervisorProfileFormValuesToPayload(values).identity).toEqual(storedIdentity)
  })
})
