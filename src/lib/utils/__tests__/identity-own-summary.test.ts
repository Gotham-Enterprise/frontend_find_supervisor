import { describe, expect, it } from 'vitest'

import { getOwnIdentitySummary } from '@/lib/utils/identity-display'

describe('getOwnIdentitySummary — the owner’s dashboard view', () => {
  it('returns every entered value, tagged with its public visibility', () => {
    expect(
      getOwnIdentitySummary({
        pronouns: ['HE_HIM_HIS', 'THEY_THEM_THEIRS'],
        showPronouns: true,
        genderIdentity: 'NON_BINARY',
        showGenderIdentity: false,
        languages: ['tl', 'en'],
        showLanguages: true,
      }),
    ).toEqual({
      pronouns: { text: 'He / Him / His, They / Them / Theirs', isPublic: true },
      genderIdentity: { text: 'Non-Binary', isPublic: false },
      languages: { text: 'Tagalog, English', isPublic: true },
    })
  })

  it('shows the self-description and never marks "Prefer Not to Say" as public', () => {
    expect(
      getOwnIdentitySummary({
        genderIdentity: 'SELF_DESCRIBE',
        customGenderIdentity: 'Agender',
        showGenderIdentity: true,
      }).genderIdentity,
    ).toEqual({ text: 'Agender', isPublic: true })

    expect(
      getOwnIdentitySummary({ genderIdentity: 'PREFER_NOT_TO_SAY', showGenderIdentity: true })
        .genderIdentity,
    ).toEqual({ text: 'Prefer Not to Say', isPublic: false })
  })

  it('returns null blocks when nothing was entered', () => {
    expect(getOwnIdentitySummary({})).toEqual({
      pronouns: null,
      genderIdentity: null,
      languages: null,
    })
    expect(getOwnIdentitySummary(undefined).languages).toBeNull()
  })
})
