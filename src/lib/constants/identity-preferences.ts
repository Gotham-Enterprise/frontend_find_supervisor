import type { SelectOption } from '@/lib/api/options'

/**
 * Optional self-identification collected at signup and editable from Profile
 * Settings. Stored values are stable codes (shared with the backend
 * validator); labels live here.
 */

// ─── Pronouns ─────────────────────────────────────────────────────────────────

export const PRONOUN_OPTIONS = [
  { value: 'HE_HIM_HIS', label: 'He / Him / His' },
  { value: 'SHE_HER_HERS', label: 'She / Her / Hers' },
  { value: 'THEY_THEM_THEIRS', label: 'They / Them / Theirs' },
] as const satisfies readonly SelectOption[]

export type PronounValue = (typeof PRONOUN_OPTIONS)[number]['value']

export const PRONOUN_VALUES = PRONOUN_OPTIONS.map((option) => option.value) as PronounValue[]

// ─── Gender identity ──────────────────────────────────────────────────────────

export const GENDER_IDENTITY_SELF_DESCRIBE = 'SELF_DESCRIBE'
export const GENDER_IDENTITY_PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'

export const GENDER_IDENTITY_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-Binary' },
  { value: GENDER_IDENTITY_SELF_DESCRIBE, label: 'Prefer to Self-Describe' },
  { value: GENDER_IDENTITY_PREFER_NOT_TO_SAY, label: 'Prefer Not to Say' },
] as const satisfies readonly SelectOption[]

export type GenderIdentityValue = (typeof GENDER_IDENTITY_OPTIONS)[number]['value']

export const GENDER_IDENTITY_VALUES = GENDER_IDENTITY_OPTIONS.map(
  (option) => option.value,
) as GenderIdentityValue[]

export const CUSTOM_GENDER_IDENTITY_MAX_LENGTH = 100

/**
 * Browse-filter choices: the named identities plus "Prefer to self-describe",
 * which matches everyone who wrote their own identity. "Prefer not to say" is
 * never shown publicly, so it cannot be a filter.
 */
export const GENDER_IDENTITY_FILTER_OPTIONS: readonly SelectOption[] =
  GENDER_IDENTITY_OPTIONS.filter((option) => option.value !== GENDER_IDENTITY_PREFER_NOT_TO_SAY)

// ─── Languages ────────────────────────────────────────────────────────────────

/**
 * Same languages the job site offers on job posts (the `Language` table served
 * by GET /api/categories/languages, minus its "Other" row), keyed by ISO 639
 * code (639-1 two-letter where one exists, otherwise 639-3) so stored values
 * survive label edits. Alphabetical by label. Keep this in step with that
 * table when a language is added
 * there — the backend only validates the code shape, not membership.
 */
export const LANGUAGE_OPTIONS: readonly SelectOption[] = [
  { value: 'am', label: 'Amharic' },
  { value: 'ar', label: 'Arabic' },
  { value: 'bn', label: 'Bengali' },
  { value: 'bho', label: 'Bhojpuri' },
  { value: 'my', label: 'Burmese' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ff', label: 'Fula' },
  { value: 'de', label: 'German' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'hak', label: 'Hakka Chinese' },
  { value: 'ha', label: 'Hausa' },
  { value: 'hi', label: 'Hindi' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'jv', label: 'Javanese' },
  { value: 'cjy', label: 'Jin Chinese' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ko', label: 'Korean' },
  { value: 'mai', label: 'Maithili' },
  { value: 'ms', label: 'Malay/Indonesian' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'cmn', label: 'Mandarin Chinese' },
  { value: 'mr', label: 'Marathi' },
  { value: 'or', label: 'Odia' },
  { value: 'om', label: 'Oromo' },
  { value: 'ps', label: 'Pashto' },
  { value: 'fa', label: 'Persian' },
  { value: 'pl', label: 'Polish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ro', label: 'Romanian' },
  { value: 'ru', label: 'Russian' },
  { value: 'sd', label: 'Sindhi' },
  { value: 'nan', label: 'Southern Min' },
  { value: 'es', label: 'Spanish' },
  { value: 'su', label: 'Sundanese' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'th', label: 'Thai' },
  { value: 'tr', label: 'Turkish' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'ur', label: 'Urdu' },
  { value: 'uz', label: 'Uzbek' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'wuu', label: 'Wu Chinese' },
  { value: 'hsn', label: 'Xiang Chinese' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'yue', label: 'Yue Chinese (Cantonese)' },
]

export const MAX_LANGUAGES = 30

// ─── Label lookups ────────────────────────────────────────────────────────────

function buildLabelMap(options: readonly SelectOption[]): ReadonlyMap<string, string> {
  return new Map(options.map((option) => [option.value, option.label]))
}

const PRONOUN_LABELS = buildLabelMap(PRONOUN_OPTIONS)
const GENDER_IDENTITY_LABELS = buildLabelMap(GENDER_IDENTITY_OPTIONS)
const LANGUAGE_LABELS = buildLabelMap(LANGUAGE_OPTIONS)

/** Label for a stored pronoun code; unknown codes are returned as-is so nothing is dropped. */
export function pronounLabel(value: string): string {
  return PRONOUN_LABELS.get(value) ?? value
}

export function genderIdentityLabel(value: string): string {
  return GENDER_IDENTITY_LABELS.get(value) ?? value
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS.get(code) ?? code
}

export function isKnownPronoun(value: string): value is PronounValue {
  return PRONOUN_LABELS.has(value)
}

export function isKnownGenderIdentity(value: string): value is GenderIdentityValue {
  return GENDER_IDENTITY_LABELS.has(value)
}
