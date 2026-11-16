import { z } from 'zod'

import {
  CUSTOM_GENDER_IDENTITY_MAX_LENGTH,
  GENDER_IDENTITY_SELF_DESCRIBE,
  GENDER_IDENTITY_VALUES,
  MAX_LANGUAGES,
  PRONOUN_VALUES,
} from '@/lib/constants/identity-preferences'
import type {
  UserIdentityPreferences,
  UserIdentityPreferencesResponse,
} from '@/types/identity-preferences'

/**
 * Form-side schema for the optional pronouns / gender identity / languages
 * block, shared by signup (both roles) and profile editing. Spread
 * `identityPreferenceFieldsSchema` into a form's object schema and run
 * `applyIdentityPreferenceRules` in its superRefine.
 */

export const CUSTOM_GENDER_IDENTITY_REQUIRED_MESSAGE = 'Please describe your gender identity'

export const identityPreferenceFieldsSchema = {
  pronouns: z.array(z.enum(PRONOUN_VALUES as [string, ...string[]])),
  showPronouns: z.boolean(),
  // '' = no selection (the field is optional)
  genderIdentity: z
    .string()
    .refine((value) => value === '' || (GENDER_IDENTITY_VALUES as string[]).includes(value), {
      message: 'Please select a gender identity',
    }),
  customGenderIdentity: z
    .string()
    .max(
      CUSTOM_GENDER_IDENTITY_MAX_LENGTH,
      `Gender identity must be ${CUSTOM_GENDER_IDENTITY_MAX_LENGTH} characters or less`,
    ),
  showGenderIdentity: z.boolean(),
  languages: z
    .array(z.string().min(1))
    .max(MAX_LANGUAGES, `Select at most ${MAX_LANGUAGES} languages`),
  showLanguages: z.boolean(),
}

export const identityPreferenceSchemaObject = z.object(identityPreferenceFieldsSchema)

export type IdentityPreferenceFormValues = z.infer<typeof identityPreferenceSchemaObject>

export const IDENTITY_PREFERENCE_FIELD_NAMES = [
  'pronouns',
  'showPronouns',
  'genderIdentity',
  'customGenderIdentity',
  'showGenderIdentity',
  'languages',
  'showLanguages',
] as const satisfies ReadonlyArray<keyof IdentityPreferenceFormValues>

/**
 * "Prefer to self-describe" needs the written identity; otherwise the text is
 * ignored. Loosely typed so any host schema's superRefine can pass its data.
 */
export function applyIdentityPreferenceRules(
  data: { genderIdentity?: unknown; customGenderIdentity?: unknown },
  ctx: z.RefinementCtx,
) {
  if (
    data.genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE &&
    !String(data.customGenderIdentity ?? '').trim()
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['customGenderIdentity'],
      message: CUSTOM_GENDER_IDENTITY_REQUIRED_MESSAGE,
    })
  }
}

/**
 * Inline `rules.validate` for the self-describe input (per-field RHF rules
 * cannot see the sibling select through a plain Zod shape lookup).
 */
export function validateCustomGenderIdentity(
  value: unknown,
  formValues: { genderIdentity?: string },
): true | string {
  const text = String(value ?? '').trim()
  if (formValues?.genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE && !text) {
    return CUSTOM_GENDER_IDENTITY_REQUIRED_MESSAGE
  }
  if (text.length > CUSTOM_GENDER_IDENTITY_MAX_LENGTH) {
    return `Gender identity must be ${CUSTOM_GENDER_IDENTITY_MAX_LENGTH} characters or less`
  }
  return true
}

/** Blank block — everything optional, visibility off by default. */
export const identityPreferenceDefaultValues: IdentityPreferenceFormValues = {
  pronouns: [],
  showPronouns: false,
  genderIdentity: '',
  customGenderIdentity: '',
  showGenderIdentity: false,
  languages: [],
  showLanguages: false,
}

/** Stored account values → form values (profile edit prefill). */
export function getIdentityPreferenceFormValues(
  user: UserIdentityPreferencesResponse | null | undefined,
): IdentityPreferenceFormValues {
  const genderIdentity = user?.genderIdentity?.trim() ?? ''
  return {
    pronouns: (user?.pronouns ?? []).filter(Boolean),
    showPronouns: user?.showPronouns === true,
    genderIdentity,
    customGenderIdentity:
      genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE
        ? (user?.customGenderIdentity?.trim() ?? '')
        : '',
    showGenderIdentity: user?.showGenderIdentity === true,
    languages: (user?.languages ?? []).filter(Boolean),
    showLanguages: user?.showLanguages === true,
  }
}

/** API shape (register + profile update). Lists are always sent so clearing persists. */
export type IdentityPreferencePayload = UserIdentityPreferences

/**
 * Accepts a partial block so forms that predate these fields (and their test
 * fixtures) still build a payload — absent fields fall back to the defaults.
 */
export function identityPreferencesToPayload(
  values: Partial<IdentityPreferenceFormValues>,
): IdentityPreferencePayload {
  const genderIdentity = (values.genderIdentity ?? '').trim() || null
  return {
    pronouns: values.pronouns ?? [],
    showPronouns: values.showPronouns === true,
    genderIdentity,
    customGenderIdentity:
      genderIdentity === GENDER_IDENTITY_SELF_DESCRIBE
        ? (values.customGenderIdentity ?? '').trim() || null
        : null,
    showGenderIdentity: values.showGenderIdentity === true,
    languages: values.languages ?? [],
    showLanguages: values.showLanguages === true,
  }
}

/**
 * Multipart encoding shared by the register and profile-update calls. Lists go
 * as JSON so an empty selection reaches the backend as `[]` (a repeated field
 * cannot express "cleared"); the gender fields are always present so the
 * backend can null a removed value.
 */
export function appendIdentityPreferencesToFormData(
  fd: FormData,
  payload: IdentityPreferencePayload,
): void {
  fd.append('pronouns', JSON.stringify(payload.pronouns))
  fd.append('showPronouns', String(payload.showPronouns))
  fd.append('genderIdentity', payload.genderIdentity ?? '')
  fd.append('customGenderIdentity', payload.customGenderIdentity ?? '')
  fd.append('showGenderIdentity', String(payload.showGenderIdentity))
  fd.append('languages', JSON.stringify(payload.languages))
  fd.append('showLanguages', String(payload.showLanguages))
}
