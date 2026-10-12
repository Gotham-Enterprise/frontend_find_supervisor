/**
 * Profession groups used by the supervision format guide, and how supervisee
 * occupations map onto them.
 *
 * Kept apart from the rules data (state-supervision-rules*.ts, ~250 KB) so
 * code that only needs labels or the occupation mapping — like the shared
 * search helpers that end up in nearly every page's bundle — stays light.
 */

export type ProfessionGroup = 'COUNSELING' | 'SOCIAL_WORK' | 'MFT' | 'PSYCHOLOGY' | 'NP' | 'PA'

/** Professions supervised by a Mental Health Counselor Supervisor. */
export const MENTAL_HEALTH_PROFESSIONS: ProfessionGroup[] = [
  'COUNSELING',
  'SOCIAL_WORK',
  'MFT',
  'PSYCHOLOGY',
]

export const PROFESSION_GROUP_LABELS: Record<ProfessionGroup, string> = {
  COUNSELING: 'Counseling (LPC / LMHC)',
  SOCIAL_WORK: 'Social Work (LCSW)',
  MFT: 'Marriage & Family Therapy (LMFT)',
  PSYCHOLOGY: 'Psychology',
  NP: 'Collaborating Physician (NP)',
  PA: 'Supervising Physician (PA)',
}

/**
 * Supervisee occupation (see SUPERVISEE_ALLOWED_OCCUPATIONS) → profession group.
 * Occupations outside these groups map to nothing.
 */
const OCCUPATION_PROFESSION_GROUPS: Record<ProfessionGroup, readonly string[]> = {
  COUNSELING: [
    'Associate Professional Counselor',
    'Associate Professional Clinical Counselor',
    'Licensed Mental Health Counselor Associate',
    'Licensed Clinical Mental Health Counselor Associate',
    'Licensed Professional Counselor Associate',
    'Provisional Licensed Professional Counselor',
    'Licensed Associate Counselor',
    'Associate Licensed Counselor',
    'Licensed Associate Professional Counselor',
    'Licensed Graduate Professional Counselor',
    'Licensed Professional Counselor In Training',
    'Registered Mental Health Counselor Intern',
    'Mental Health Counselor, Limited Permit',
  ],
  MFT: [
    'Associate Marriage and Family Therapist',
    'Licensed Marriage and Family Therapist Associate',
    'Licensed Associate Marriage and Family Therapist',
    'Marriage and Family Therapist Intern',
    'Registered Marriage and Family Therapist Intern',
  ],
  SOCIAL_WORK: [
    'Associate Clinical Social Worker',
    'Clinical Social Work Associate',
    'Licensed Social Worker',
    'Licensed Master Social Worker',
    'Licensed Graduate Social Worker',
    'Licensed Social Worker Associate Independent Clinical',
  ],
  PSYCHOLOGY: ['Licensed Psychological Associate', 'Psychologist Intern'],
  NP: ['Nurse Practitioner'],
  PA: ['Physician Assistant'],
}

const OCCUPATION_TO_PROFESSION = new Map<string, ProfessionGroup>(
  (Object.entries(OCCUPATION_PROFESSION_GROUPS) as [ProfessionGroup, readonly string[]][]).flatMap(
    ([group, names]) => names.map((name) => [name.trim().toLowerCase(), group] as const),
  ),
)

export function getProfessionGroupForOccupation(
  occupationName: string | null | undefined,
): ProfessionGroup | null {
  if (!occupationName) return null
  return OCCUPATION_TO_PROFESSION.get(occupationName.trim().toLowerCase()) ?? null
}
