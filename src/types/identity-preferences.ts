/**
 * Optional self-identification stored on the account (both roles), as returned
 * by the profile APIs. Codes, not labels — see `lib/constants/identity-preferences`.
 *
 * Visibility: the owner receives every field; other viewers only receive a
 * block when its `show*` flag is on (the backend strips the rest and never
 * returns "Prefer not to say"). The display helpers in
 * `lib/utils/identity-display` re-apply the same rules client-side.
 */
export interface UserIdentityPreferences {
  pronouns: string[]
  showPronouns: boolean
  genderIdentity: string | null
  customGenderIdentity: string | null
  showGenderIdentity: boolean
  languages: string[]
  showLanguages: boolean
}

/** Older cached responses may predate these columns, so every field is optional on the wire. */
export type UserIdentityPreferencesResponse = Partial<UserIdentityPreferences>
