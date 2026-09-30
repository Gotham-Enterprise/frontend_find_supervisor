/**
 * Per-state rules on which supervision formats count toward licensure.
 *
 * Pilot dataset (TX, CA, FL, NY, IL × counseling / social work / MFT / psychology).
 * Every entry is sourced from the state board's regulation or statute text —
 * not from board FAQ/guidance pages, which are often out of date.
 *
 * Informational only: never use this to hide or block Supervisors.
 */

export type ProfessionGroup = 'COUNSELING' | 'SOCIAL_WORK' | 'MFT' | 'PSYCHOLOGY'

/**
 * Whether remote (video) supervision counts toward licensure hours.
 * - ALLOWED: counts, no cap on hours
 * - LIMITED: counts, but capped or conditional (e.g. max 50%)
 * - NOT_ALLOWED: must be in person
 * - NOT_SPECIFIED: rules are silent — tell the user to check with their board
 */
export type RemoteSupervisionStatus = 'ALLOWED' | 'LIMITED' | 'NOT_ALLOWED' | 'NOT_SPECIFIED'

export interface StateSupervisionRule {
  /** US state code, matches the state option `value` (e.g. "TX"). */
  state: string
  profession: ProfessionGroup
  licensePath: string
  board: string
  remoteStatus: RemoteSupervisionStatus
  /** The cap or condition when remoteStatus is LIMITED. */
  remoteLimit: string | null
  /** Plain-English summary shown to Supervisees. */
  summary: string
  conditions: string[]
  citation: string
  sourceUrl: string
  /** ISO date the entry was last checked against the source. */
  lastVerified: string
  /** Internal: MEDIUM entries should be re-checked before the guide goes live. */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export const PROFESSION_GROUP_LABELS: Record<ProfessionGroup, string> = {
  COUNSELING: 'Counseling (LPC / LMHC)',
  SOCIAL_WORK: 'Social Work (LCSW)',
  MFT: 'Marriage & Family Therapy (LMFT)',
  PSYCHOLOGY: 'Psychology',
}

const PILOT_VERIFIED = '2026-09-30'

const FL_BOARD =
  'Florida Board of Clinical Social Work, Marriage & Family Therapy and Mental Health Counseling'
const FL_RULE = {
  remoteStatus: 'LIMITED',
  remoteLimit:
    'At least 50% of supervision must be in person; group supervision must be fully in person.',
  summary:
    'Up to half of your supervision can be by video after a first in-person meeting. Your supervisor may allow fully remote supervision if needed for health or safety.',
  conditions: [
    'At least one in-person meeting before any video supervision',
    'Group supervision must be in person',
    'Supervisor may allow 100% remote when necessary for health, safety, or welfare',
  ],
  citation: 'Fla. Admin. Code R. 64B4-2.002(3), (4), (7)',
  sourceUrl: 'https://www.flrules.org/gateway/ruleNo.asp?id=64B4-2.002',
  lastVerified: PILOT_VERIFIED,
  confidence: 'HIGH',
} as const

const NY_CONDITIONS = [
  'Secure, real-time video conferencing',
  'Technology must be acceptable to NYSED',
]

const CA_BOARD = 'California Board of Behavioral Sciences (BBS)'
const CA_CONDITIONS = [
  'Two-way, real-time video only — phone does not count',
  'Supervisor must document that video is appropriate within 60 days',
]
const CA_SUMMARY =
  'Supervision can be in person, by live video, or a mix, in any work setting, as long as your supervisor documents that video is appropriate.'

export const STATE_SUPERVISION_RULES: StateSupervisionRule[] = [
  // ── California ────────────────────────────────────────────────────────────
  {
    state: 'CA',
    profession: 'COUNSELING',
    licensePath: 'APCC → LPCC',
    board: CA_BOARD,
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary: CA_SUMMARY,
    conditions: CA_CONDITIONS,
    citation: 'Cal. Bus. & Prof. Code §4999.46.2',
    sourceUrl:
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=4999.46.2',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CA',
    profession: 'SOCIAL_WORK',
    licensePath: 'ASW → LCSW',
    board: CA_BOARD,
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary: CA_SUMMARY,
    conditions: CA_CONDITIONS,
    citation: 'Cal. Bus. & Prof. Code §4996.23.1',
    sourceUrl:
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=4996.23.1',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CA',
    profession: 'MFT',
    licensePath: 'AMFT → LMFT',
    board: CA_BOARD,
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary: CA_SUMMARY,
    conditions: CA_CONDITIONS,
    citation: 'Cal. Bus. & Prof. Code §4980.43.2',
    sourceUrl:
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=4980.43.2',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Registered Psychological Associate → Licensed Psychologist',
    board: 'California Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'All supervision toward licensure can be in person or by live video, with no cap. Audio-only calls do not count.',
    conditions: [
      'Live (synchronous) video — audio-only does not count',
      'Your primary supervisor must be employed in your work setting',
    ],
    citation: 'Cal. Bus. & Prof. Code §2914(c)(1), §2913(c)(1); 16 CCR §1387(b)(6)',
    sourceUrl:
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=2914',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },

  // ── Florida (one rule covers all Chapter 491 professions) ─────────────────
  {
    state: 'FL',
    profession: 'COUNSELING',
    licensePath: 'Registered MHC Intern → LMHC',
    board: FL_BOARD,
    ...FL_RULE,
    conditions: [...FL_RULE.conditions],
  },
  {
    state: 'FL',
    profession: 'SOCIAL_WORK',
    licensePath: 'Registered CSW Intern → LCSW',
    board: FL_BOARD,
    ...FL_RULE,
    conditions: [...FL_RULE.conditions],
  },
  {
    state: 'FL',
    profession: 'MFT',
    licensePath: 'Registered MFT Intern → LMFT',
    board: FL_BOARD,
    ...FL_RULE,
    conditions: [...FL_RULE.conditions],
  },
  {
    state: 'FL',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral Resident → Licensed Psychologist',
    board: 'Florida Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'All weekly postdoctoral supervision, including the required individual hour, can be over HIPAA-compliant video, with no cap.',
    conditions: [
      'HIPAA-compliant video',
      'Out-of-state supervisors need a Florida psychologist available for emergencies',
    ],
    citation: 'Fla. Admin. Code R. 64B19-11.005(2)(c)3.',
    sourceUrl: 'https://www.flrules.org/gateway/ruleNo.asp?id=64B19-11.005',
    lastVerified: PILOT_VERIFIED,
    // The Board noticed rule development on supervised experience on 2026-09-28.
    confidence: 'HIGH',
  },

  // ── Illinois ──────────────────────────────────────────────────────────────
  {
    state: 'IL',
    profession: 'COUNSELING',
    licensePath: 'LPC → LCPC',
    board: 'Illinois Department of Financial and Professional Regulation (IDFPR)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Real-time video supervision counts as face-to-face, with no cap. You need at least one hour of supervision each week.',
    conditions: [
      'Synchronous video with verbal and visual interaction — audio-only does not count',
    ],
    citation: '68 Ill. Adm. Code 1375.130(e)(1); 225 ILCS 107/10',
    sourceUrl: 'https://www.law.cornell.edu/regulations/illinois/Ill-Admin-Code-tit-68-SS-1375.130',
    lastVerified: PILOT_VERIFIED,
    // Video allowance lives in the statute's "face-to-face" definition, which
    // could not be fetched from ilga.gov during research.
    confidence: 'MEDIUM',
  },
  {
    state: 'IL',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSW → LCSW',
    board: 'Illinois Department of Financial and Professional Regulation (IDFPR)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Illinois rules require about 4 hours of supervision a month but do not say whether it must be in person. Confirm with IDFPR before relying on video hours.',
    conditions: [],
    citation: '68 Ill. Adm. Code 1470.20(a)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/illinois/Ill-Admin-Code-tit-68-SS-1470.20',
    lastVerified: PILOT_VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'IL',
    profession: 'MFT',
    licensePath: 'Associate LMFT → LMFT',
    board: 'Illinois Department of Financial and Professional Regulation (IDFPR)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Live, real-time video supervision counts toward all 200 required supervision hours, with no cap.',
    conditions: [
      'Synchronous video with verbal and visual interaction — audio-only does not count',
      'Must comply with confidentiality laws',
    ],
    citation: '68 Ill. Adm. Code 1283.25(f)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/illinois/Ill-Admin-Code-tit-68-SS-1283.25',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IL',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral → Licensed Clinical Psychologist',
    board: 'Illinois Department of Financial and Professional Regulation (IDFPR)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Live, two-way video supervision counts as face-to-face, so in-person, virtual, and hybrid supervision all count, with no cap.',
    conditions: ['Synchronous video with verbal and visual interaction'],
    citation: '68 Ill. Adm. Code 1400.10; 1400.110(d)(5)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/illinois/Ill-Admin-Code-tit-68-SS-1400.10',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },

  // ── New York ──────────────────────────────────────────────────────────────
  {
    state: 'NY',
    profession: 'COUNSELING',
    licensePath: 'Limited Permit → LMHC',
    board: 'NYSED Office of the Professions',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary: 'Supervision can be in person or over secure video, with no cap on virtual hours.',
    conditions: NY_CONDITIONS,
    citation: '8 NYCRR §79-9.3(c)',
    sourceUrl:
      'https://www.op.nysed.gov/professions/mental-health-counselors/laws-rules-regulations/subpart-799',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NY',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'NYSED Office of the Professions',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'The 100+ hours of clinical supervision can be in person or over secure video, with no cap on virtual hours.',
    conditions: NY_CONDITIONS,
    citation: '8 NYCRR §74.6(c)(1)(v)',
    sourceUrl:
      'https://www.op.nysed.gov/professions/licensed-clinical-social-worker-lcsw/laws-rules-regulations/part-74',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NY',
    profession: 'MFT',
    licensePath: 'Limited Permit → LMFT',
    board: 'NYSED Office of the Professions',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary: 'Supervision can be in person or over secure video, with no cap on virtual hours.',
    conditions: NY_CONDITIONS,
    citation: '8 NYCRR §79-10.3(d)',
    sourceUrl:
      'https://www.op.nysed.gov/professions/marriage-and-family-therapists/laws-rules-regulations/subpart-7910',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NY',
    profession: 'PSYCHOLOGY',
    licensePath: 'Limited Permit → Licensed Psychologist',
    board: 'NYSED Office of the Professions',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Required face-to-face supervision can be in person or by secure live video, with no cap on virtual hours.',
    conditions: NY_CONDITIONS,
    citation: '8 NYCRR §72.2(e)(2)(iii)',
    sourceUrl: 'https://www.op.nysed.gov/professions/psychology/laws-rules-regulations/part-72',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },

  // ── Texas ─────────────────────────────────────────────────────────────────
  {
    state: 'TX',
    profession: 'COUNSELING',
    licensePath: 'LPC Associate → LPC',
    board: 'Texas State Board of Examiners of Professional Counselors (BHEC)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Texas rules require at least 4 hours of supervision a month with an LPC-S but do not say whether it must be in person. Confirm with the board before relying on video hours.',
    conditions: [],
    citation: '22 TAC §681.92(e); §681.93',
    sourceUrl: 'https://bhec.texas.gov/wp-content/uploads/2026/03/LPC-Rulebook-2026-March.pdf',
    lastVerified: PILOT_VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'TX',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Texas State Board of Social Worker Examiners (BHEC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person, by video, or by phone, as long as the technology is HIPAA-compliant and the format is in your supervision plan.',
    conditions: [
      'HIPAA-compliant technology',
      'Format must be written into the supervision plan',
      'The board prefers in-person supervision for a substantial part (not required)',
    ],
    citation: '22 TAC §781.403(b)(4), (b)(6)',
    sourceUrl: 'https://bhec.texas.gov/wp-content/uploads/2026/04/SW-Rulebook-2026-March.pdf',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'TX',
    profession: 'MFT',
    licensePath: 'LMFT Associate → LMFT',
    board: 'Texas State Board of Examiners of Marriage and Family Therapists (BHEC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live video with no cap. Phone counts only if your supervisor decides in-person or video is not accessible.',
    conditions: [
      'Live (synchronous) video',
      'Phone only when in-person or video is not accessible',
    ],
    citation: '22 TAC §801.142(3)(B)',
    sourceUrl: 'https://bhec.texas.gov/wp-content/uploads/2026/03/MFT-Rulebook-2026-March.pdf',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'TX',
    profession: 'PSYCHOLOGY',
    licensePath: 'Provisionally Licensed Psychologist / LPA → Licensed Psychologist',
    board: 'Texas State Board of Examiners of Psychologists (BHEC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Live video supervision can count for all of your supervised hours. Phone or other non-video remote supervision can make up no more than half.',
    conditions: [
      'Live (synchronous) video can exceed 50%',
      'Phone or other non-video remote supervision is capped at 50%',
    ],
    citation: '22 TAC §465.2(a)(7)',
    sourceUrl: 'https://bhec.texas.gov/wp-content/uploads/2026/06/PSY-Rulebook-2026-March.pdf',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
]

export function getStateSupervisionRules(state: string): StateSupervisionRule[] {
  const code = state.trim().toUpperCase()
  return STATE_SUPERVISION_RULES.filter((r) => r.state === code)
}

export function getStateSupervisionRule(
  state: string,
  profession: ProfessionGroup,
): StateSupervisionRule | undefined {
  return getStateSupervisionRules(state).find((r) => r.profession === profession)
}

/**
 * In-person always counts. Hybrid counts whenever any remote supervision
 * counts, so it follows the remote status.
 */
export function getFormatStatuses(rule: StateSupervisionRule): {
  inPerson: RemoteSupervisionStatus
  hybrid: RemoteSupervisionStatus
  remote: RemoteSupervisionStatus
} {
  const remote = rule.remoteStatus
  const hybrid: RemoteSupervisionStatus = remote === 'LIMITED' ? 'ALLOWED' : remote
  return { inPerson: 'ALLOWED', hybrid, remote }
}

/**
 * Supervisee occupation (see SUPERVISEE_ALLOWED_OCCUPATIONS) → profession group.
 * NP and PA are not covered yet, so they map to nothing.
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
