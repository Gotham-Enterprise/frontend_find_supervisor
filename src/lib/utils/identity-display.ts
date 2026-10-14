import {
  GENDER_IDENTITY_PREFER_NOT_TO_SAY,
  GENDER_IDENTITY_SELF_DESCRIBE,
  genderIdentityLabel,
  languageLabel,
  pronounLabel,
} from '@/lib/constants/identity-preferences'
import type { UserIdentityPreferencesResponse } from '@/types/identity-preferences'

/**
 * Public-display rules for the identity preferences. Each block is shown only
 * when (a) its visibility flag is on and (b) it has a value; "Prefer not to
 * say" is never shown. The backend already strips hidden blocks for other
 * viewers — these helpers make the owner's own public-profile view match and
 * keep every renderer on one rule set.
 */

export function getVisiblePronounLabels(
  user: UserIdentityPreferencesResponse | null | undefined,
): string[] {
  if (!user?.showPronouns) return []
  return (user.pronouns ?? []).filter(Boolean).map(pronounLabel)
}

/** Pronouns as one readable line, e.g. "He / Him / His, They / Them / Theirs". */
export function formatPronouns(labels: readonly string[]): string {
  return labels.join(', ')
}

export function getVisibleGenderIdentityLabel(
  user: UserIdentityPreferencesResponse | null | undefined,
): string | null {
  if (!user?.showGenderIdentity) return null
  const value = user.genderIdentity?.trim()
  if (!value || value === GENDER_IDENTITY_PREFER_NOT_TO_SAY) return null
  if (value === GENDER_IDENTITY_SELF_DESCRIBE) {
    const custom = user.customGenderIdentity?.trim()
    return custom || null
  }
  return genderIdentityLabel(value)
}

export function getVisibleLanguageLabels(
  user: UserIdentityPreferencesResponse | null | undefined,
): string[] {
  if (!user?.showLanguages) return []
  return (user.languages ?? []).filter(Boolean).map(languageLabel)
}

/** Identity fields as returned for someone else's profile (already gated server-side). */
export interface PublicIdentityFields {
  pronouns?: string[] | null
  genderIdentity?: string | null
  customGenderIdentity?: string | null
  languages?: string[] | null
}

export interface PublicIdentityLabels {
  /** One readable line, e.g. "He / Him / His, They / Them / Theirs"; '' when none. */
  pronouns: string
  genderIdentity: string | null
  languages: string[]
}

/**
 * Labels for rows the API has already filtered to what the person made
 * public (search results, SEO profile). The visibility flags are implied, so
 * only the value rules apply.
 */
export function formatPublicIdentity(fields: PublicIdentityFields): PublicIdentityLabels {
  const gated = {
    pronouns: fields.pronouns ?? [],
    showPronouns: true,
    genderIdentity: fields.genderIdentity ?? null,
    customGenderIdentity: fields.customGenderIdentity ?? null,
    showGenderIdentity: true,
    languages: fields.languages ?? [],
    showLanguages: true,
  }
  return {
    pronouns: formatPronouns(getVisiblePronounLabels(gated)),
    genderIdentity: getVisibleGenderIdentityLabel(gated),
    languages: getVisibleLanguageLabels(gated),
  }
}
