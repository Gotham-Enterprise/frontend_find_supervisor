import { describe, expect, it } from 'vitest'

import {
  GENDER_IDENTITY_PREFER_NOT_TO_SAY,
  GENDER_IDENTITY_SELF_DESCRIBE,
  PRONOUN_VALUES,
} from '@/lib/constants/identity-preferences'
import {
  appendIdentityPreferencesToFormData,
  applyIdentityPreferenceRules,
  CUSTOM_GENDER_IDENTITY_REQUIRED_MESSAGE,
  getIdentityPreferenceFormValues,
  identityPreferenceDefaultValues,
  identityPreferenceSchemaObject,
  identityPreferencesToPayload,
} from '@/lib/forms/identity-preferences'

const schema = identityPreferenceSchemaObject.superRefine(applyIdentityPreferenceRules)

describe('identity preferences — schema', () => {
  it('accepts the blank defaults (every field optional, visibility off)', () => {
    const result = schema.safeParse(identityPreferenceDefaultValues)
    expect(result.success).toBe(true)
    expect(identityPreferenceDefaultValues.showPronouns).toBe(false)
    expect(identityPreferenceDefaultValues.showGenderIdentity).toBe(false)
    expect(identityPreferenceDefaultValues.showLanguages).toBe(false)
  })

  it.each([
    ['one pronoun', [PRONOUN_VALUES[0]]],
    ['two pronouns', [PRONOUN_VALUES[0], PRONOUN_VALUES[2]]],
    ['all pronouns', [...PRONOUN_VALUES]],
  ])('accepts %s', (_label, pronouns) => {
    const result = schema.safeParse({ ...identityPreferenceDefaultValues, pronouns })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown pronoun code', () => {
    const result = schema.safeParse({ ...identityPreferenceDefaultValues, pronouns: ['XE_XEM'] })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown gender identity but accepts the empty selection', () => {
    expect(
      schema.safeParse({ ...identityPreferenceDefaultValues, genderIdentity: 'OTHER' }).success,
    ).toBe(false)
    expect(
      schema.safeParse({ ...identityPreferenceDefaultValues, genderIdentity: '' }).success,
    ).toBe(true)
  })

  it('requires the written identity only for "Prefer to self-describe"', () => {
    const missing = schema.safeParse({
      ...identityPreferenceDefaultValues,
      genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
      customGenderIdentity: '   ',
    })
    expect(missing.success).toBe(false)
    if (!missing.success) {
      expect(missing.error.issues[0]?.path).toEqual(['customGenderIdentity'])
      expect(missing.error.issues[0]?.message).toBe(CUSTOM_GENDER_IDENTITY_REQUIRED_MESSAGE)
    }

    const provided = schema.safeParse({
      ...identityPreferenceDefaultValues,
      genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
      customGenderIdentity: 'Genderfluid',
    })
    expect(provided.success).toBe(true)

    const notSelfDescribe = schema.safeParse({
      ...identityPreferenceDefaultValues,
      genderIdentity: 'FEMALE',
      customGenderIdentity: '',
    })
    expect(notSelfDescribe.success).toBe(true)
  })

  it('accepts multiple languages', () => {
    const result = schema.safeParse({
      ...identityPreferenceDefaultValues,
      languages: ['en', 'es', 'tl'],
    })
    expect(result.success).toBe(true)
  })
})

describe('identity preferences — payload mapping', () => {
  it('keeps the written identity only alongside "Prefer to self-describe"', () => {
    expect(
      identityPreferencesToPayload({
        ...identityPreferenceDefaultValues,
        genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
        customGenderIdentity: '  Agender ',
      }).customGenderIdentity,
    ).toBe('Agender')

    expect(
      identityPreferencesToPayload({
        ...identityPreferenceDefaultValues,
        genderIdentity: 'MALE',
        customGenderIdentity: 'stale text',
      }).customGenderIdentity,
    ).toBeNull()
  })

  it('maps an empty selection to null and preserves each visibility flag independently', () => {
    const payload = identityPreferencesToPayload({
      ...identityPreferenceDefaultValues,
      showPronouns: true,
      showLanguages: true,
    })
    expect(payload.genderIdentity).toBeNull()
    expect(payload.showPronouns).toBe(true)
    expect(payload.showGenderIdentity).toBe(false)
    expect(payload.showLanguages).toBe(true)
  })

  it('falls back to the defaults for a form that never collected the block', () => {
    expect(identityPreferencesToPayload({})).toEqual({
      pronouns: [],
      showPronouns: false,
      genderIdentity: null,
      customGenderIdentity: null,
      showGenderIdentity: false,
      languages: [],
      showLanguages: false,
    })
  })

  it('encodes lists as JSON so a cleared selection reaches the API as []', () => {
    const fd = new FormData()
    appendIdentityPreferencesToFormData(fd, identityPreferencesToPayload({}))
    expect(fd.get('pronouns')).toBe('[]')
    expect(fd.get('languages')).toBe('[]')
    expect(fd.get('genderIdentity')).toBe('')
    expect(fd.get('customGenderIdentity')).toBe('')
    expect(fd.get('showPronouns')).toBe('false')
    expect(fd.get('showGenderIdentity')).toBe('false')
    expect(fd.get('showLanguages')).toBe('false')

    const filled = new FormData()
    appendIdentityPreferencesToFormData(
      filled,
      identityPreferencesToPayload({
        ...identityPreferenceDefaultValues,
        pronouns: ['HE_HIM_HIS', 'THEY_THEM_THEIRS'],
        showPronouns: true,
        languages: ['en', 'ko'],
      }),
    )
    expect(filled.get('pronouns')).toBe('["HE_HIM_HIS","THEY_THEM_THEIRS"]')
    expect(filled.get('showPronouns')).toBe('true')
    expect(filled.get('languages')).toBe('["en","ko"]')
  })
})

describe('identity preferences — profile edit prefill', () => {
  it('loads stored values back into the form, including the self-description', () => {
    expect(
      getIdentityPreferenceFormValues({
        pronouns: ['SHE_HER_HERS'],
        showPronouns: true,
        genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
        customGenderIdentity: 'Two-Spirit',
        showGenderIdentity: true,
        languages: ['en', 'nv'],
        showLanguages: false,
      }),
    ).toEqual({
      pronouns: ['SHE_HER_HERS'],
      showPronouns: true,
      genderIdentity: GENDER_IDENTITY_SELF_DESCRIBE,
      customGenderIdentity: 'Two-Spirit',
      showGenderIdentity: true,
      languages: ['en', 'nv'],
      showLanguages: false,
    })
  })

  it('drops a stray self-description when the stored identity is not self-described', () => {
    const values = getIdentityPreferenceFormValues({
      genderIdentity: GENDER_IDENTITY_PREFER_NOT_TO_SAY,
      customGenderIdentity: 'leftover',
    })
    expect(values.genderIdentity).toBe(GENDER_IDENTITY_PREFER_NOT_TO_SAY)
    expect(values.customGenderIdentity).toBe('')
  })

  it('returns the blank defaults for a user without the columns', () => {
    expect(getIdentityPreferenceFormValues(undefined)).toEqual(identityPreferenceDefaultValues)
    expect(getIdentityPreferenceFormValues({})).toEqual(identityPreferenceDefaultValues)
  })
})
