import { describe, expect, it } from 'vitest'

import {
  editSuperviseeProfileSchema,
  getDefaultSuperviseeProfileFormValues,
  superviseeProfileFormValuesToPayload,
} from '@/lib/forms/supervisee-profile-edit'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

function makeProfile(overrides: Partial<SuperviseeProfileData> = {}): SuperviseeProfileData {
  return {
    id: 'profile-1',
    userId: 'user-1',
    typeOfSupervisorNeeded: ['Mental Health Counselors'],
    howSoonLooking: 'IMMEDIATELY',
    lookingDate: null,
    preferredFormat: 'VIRTUAL',
    title: 'AMFT',
    availability: 'FLEXIBLE',
    idealSupervisor: 'Supportive supervisor with CBT experience.',
    stateTheyAreLookingIn: ['CA'],
    budgetRangeType: 'PER_SESSION',
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
    },
    ...overrides,
  }
}

describe('needsMedicalDirector — supervisee profile edit round trip', () => {
  it('splits a stored [type, Medical Director] array into dropdown value and checkbox', () => {
    const values = getDefaultSuperviseeProfileFormValues(
      makeProfile({ typeOfSupervisorNeeded: ['Mental Health Counselors', 'Medical Director'] }),
    )
    expect(values.typeOfSupervisorNeeded).toBe('Mental Health Counselors')
    expect(values.needsMedicalDirector).toBe(true)
  })

  it('loads a Medical Director-only profile with an empty dropdown and the checkbox on', () => {
    const values = getDefaultSuperviseeProfileFormValues(
      makeProfile({ typeOfSupervisorNeeded: ['Medical Director'] }),
    )
    expect(values.typeOfSupervisorNeeded).toBe('')
    expect(values.needsMedicalDirector).toBe(true)
  })

  it('keeps the Medical Director entry when saving — no silent data loss', () => {
    const defaults = getDefaultSuperviseeProfileFormValues(
      makeProfile({ typeOfSupervisorNeeded: ['Mental Health Counselors', 'Medical Director'] }),
    )
    const payload = superviseeProfileFormValuesToPayload(defaults)
    expect(payload.typeOfSupervisorNeeded).toEqual(['Mental Health Counselors', 'Medical Director'])
  })

  it('sends only the selected type when the checkbox is off', () => {
    const defaults = getDefaultSuperviseeProfileFormValues(makeProfile())
    const payload = superviseeProfileFormValuesToPayload(defaults)
    expect(payload.typeOfSupervisorNeeded).toEqual(['Mental Health Counselors'])
  })

  it('sends empty occupation/specialty (not undefined) so switching to Medical Director-only clears them', () => {
    const defaults = getDefaultSuperviseeProfileFormValues(makeProfile())
    const payload = superviseeProfileFormValuesToPayload({
      ...defaults,
      typeOfSupervisorNeeded: '',
      superviseeOccupation: '',
      superviseeSpecialty: '',
      needsMedicalDirector: true,
    })
    expect(payload.typeOfSupervisorNeeded).toEqual(['Medical Director'])
    expect(payload.superviseeOccupation).toBe('')
    expect(payload.superviseeSpecialty).toBe('')
  })
})

describe('editSuperviseeProfileSchema — supervision type requiredness', () => {
  const validValues = getDefaultSuperviseeProfileFormValues(makeProfile())

  it('accepts a supervision type without the checkbox', () => {
    expect(editSuperviseeProfileSchema.safeParse(validValues).success).toBe(true)
  })

  it('accepts a Medical Director-only request — no type or occupation', () => {
    expect(
      editSuperviseeProfileSchema.safeParse({
        ...validValues,
        typeOfSupervisorNeeded: '',
        superviseeOccupation: '',
        needsMedicalDirector: true,
      }).success,
    ).toBe(true)
  })

  it('rejects when neither a type nor the checkbox is provided', () => {
    const result = editSuperviseeProfileSchema.safeParse({
      ...validValues,
      typeOfSupervisorNeeded: '',
      superviseeOccupation: '',
      needsMedicalDirector: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain('typeOfSupervisorNeeded')
    }
  })

  it('requires the occupation cascade only when a type is selected', () => {
    const result = editSuperviseeProfileSchema.safeParse({
      ...validValues,
      superviseeOccupation: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain('superviseeOccupation')
    }
  })
})
