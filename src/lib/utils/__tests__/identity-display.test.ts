import { describe, expect, it } from 'vitest'

import {
  formatPronouns,
  getVisibleGenderIdentityLabel,
  getVisibleLanguageLabels,
  getVisiblePronounLabels,
} from '@/lib/utils/identity-display'

describe('identity display — public profile visibility rules', () => {
  it('hides every block while its visibility flag is off, independently', () => {
    const user = {
      pronouns: ['HE_HIM_HIS'],
      showPronouns: false,
      genderIdentity: 'MALE',
      showGenderIdentity: true,
      languages: ['en'],
      showLanguages: false,
    }
    expect(getVisiblePronounLabels(user)).toEqual([])
    expect(getVisibleGenderIdentityLabel(user)).toBe('Male')
    expect(getVisibleLanguageLabels(user)).toEqual([])
  })

  it('shows nothing for an empty value even when visibility is on', () => {
    const user = {
      pronouns: [],
      showPronouns: true,
      genderIdentity: '',
      showGenderIdentity: true,
      languages: [],
      showLanguages: true,
    }
    expect(getVisiblePronounLabels(user)).toEqual([])
    expect(getVisibleGenderIdentityLabel(user)).toBeNull()
    expect(getVisibleLanguageLabels(user)).toEqual([])
  })

  it('never shows "Prefer not to say"', () => {
    expect(
      getVisibleGenderIdentityLabel({
        genderIdentity: 'PREFER_NOT_TO_SAY',
        showGenderIdentity: true,
      }),
    ).toBeNull()
  })

  it('uses the written identity for "Prefer to self-describe"', () => {
    expect(
      getVisibleGenderIdentityLabel({
        genderIdentity: 'SELF_DESCRIBE',
        customGenderIdentity: ' Genderqueer ',
        showGenderIdentity: true,
      }),
    ).toBe('Genderqueer')
    expect(
      getVisibleGenderIdentityLabel({
        genderIdentity: 'SELF_DESCRIBE',
        customGenderIdentity: '',
        showGenderIdentity: true,
      }),
    ).toBeNull()
  })

  it('maps codes to labels and formats multiple pronouns readably', () => {
    const labels = getVisiblePronounLabels({
      pronouns: ['HE_HIM_HIS', 'THEY_THEM_THEIRS'],
      showPronouns: true,
    })
    expect(labels).toEqual(['He / Him / His', 'They / Them / Theirs'])
    expect(formatPronouns(labels)).toBe('He / Him / His, They / Them / Theirs')
    expect(
      getVisibleLanguageLabels({ languages: ['en', 'tl', 'cmn'], showLanguages: true }),
    ).toEqual(['English', 'Tagalog', 'Mandarin Chinese'])
  })

  it('tolerates a user object without the identity columns', () => {
    expect(getVisiblePronounLabels(undefined)).toEqual([])
    expect(getVisibleGenderIdentityLabel({})).toBeNull()
    expect(getVisibleLanguageLabels(null)).toEqual([])
  })
})
