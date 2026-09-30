/**
 * Per-state rules for the physician relationship NPs (Collaborating Physician)
 * and PAs (Supervising Physician) need to practice.
 *
 * Unlike mental-health supervision, this isn't about counting supervision
 * hours toward a license — NPs and PAs are already licensed. What matters to
 * them (and to a marketplace of mostly remote physicians) is whether a
 * physician is needed at all, whether that physician can be remote, and what
 * ongoing oversight the state requires.
 *
 * Pilot dataset (TX, CA, FL, NY, IL). Sourced from statute/regulation text.
 * Informational only: never use this to hide or block Supervisors.
 */

export type PhysicianRole = 'NP' | 'PA'

export type CollaborationRequiredStatus = 'NOT_REQUIRED' | 'TRANSITION_PERIOD' | 'REQUIRED'
export type RemotePhysicianStatus = 'ALLOWED' | 'LIMITED' | 'NOT_ALLOWED' | 'NOT_SPECIFIED'
export type RequirementStatus = 'REQUIRED' | 'NOT_REQUIRED' | 'NOT_SPECIFIED'
export type RatioStatus = 'LIMIT' | 'NONE' | 'NOT_SPECIFIED'

export interface OversightField<S extends string> {
  status: S
  /** Short plain-English specifics, e.g. "Quarterly" or "Max 8 PAs". */
  detail: string | null
}

export interface PhysicianOversightRule {
  /** US state code, matches the state option `value` (e.g. "TX"). */
  state: string
  role: PhysicianRole
  licensePath: string
  board: string
  collaborationRequired: OversightField<CollaborationRequiredStatus>
  remotePhysician: OversightField<RemotePhysicianStatus>
  inPersonMeetings: OversightField<RequirementStatus>
  chartReview: OversightField<RequirementStatus>
  ratioLimit: OversightField<RatioStatus>
  /** Plain-English summary shown to NPs/PAs. */
  summary: string
  otherConditions: string[]
  citation: string
  sourceUrl: string
  /** ISO date the entry was last checked against the source. */
  lastVerified: string
  /** Internal: MEDIUM entries should be re-checked before the guide goes live. */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export const PHYSICIAN_ROLE_LABELS: Record<PhysicianRole, string> = {
  NP: 'Nurse Practitioners (Collaborating Physician)',
  PA: 'Physician Assistants (Supervising Physician)',
}

const PILOT_VERIFIED = '2026-09-30'

export const PHYSICIAN_OVERSIGHT_RULES: PhysicianOversightRule[] = [
  {
    state: 'CA',
    role: 'NP',
    licensePath: 'NP with standardized procedures; 103 / 104 NP',
    board: 'California Board of Registered Nursing (BRN)',
    collaborationRequired: {
      status: 'TRANSITION_PERIOD',
      detail: 'Until 103 NP status (3 years / 4,600 hours); 104 NP is fully independent',
    },
    remotePhysician: { status: 'ALLOWED', detail: 'Yes; reachable by phone during patient exams' },
    inPersonMeetings: { status: 'NOT_REQUIRED', detail: null },
    chartReview: { status: 'NOT_SPECIFIED', detail: 'Set in each standardized procedure' },
    ratioLimit: { status: 'LIMIT', detail: 'Max 4 NPs furnishing drugs per physician' },
    summary:
      "A remote physician works in California: under standardized procedures the physician doesn't need to be on site but must be reachable by phone when you see patients. 103/104 NPs don't need standardized procedures.",
    otherConditions: [
      'Written standardized procedure approved by physician, NP, and facility',
      'Schedule II–III need a patient-specific protocol',
      '103 NPs must practice in a group setting with a physician',
    ],
    citation: 'Cal. Bus. & Prof. Code §2836.1, §§2837.101–2837.105; 16 CCR §1474',
    sourceUrl:
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=2836.1',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CA',
    role: 'PA',
    licensePath: 'Licensed PA (practice agreement)',
    board: 'Physician Assistant Board of California',
    collaborationRequired: {
      status: 'REQUIRED',
      detail: 'Always; written practice agreement with a supervising physician',
    },
    remotePhysician: {
      status: 'ALLOWED',
      detail: 'Yes; reachable by phone or electronically during exams',
    },
    inPersonMeetings: { status: 'NOT_REQUIRED', detail: null },
    chartReview: { status: 'NOT_REQUIRED', detail: 'Only if the practice agreement requires it' },
    ratioLimit: { status: 'LIMIT', detail: 'Max 8 PAs per physician (since Jan 2026)' },
    summary:
      "A remote supervising physician works in California: the physician doesn't need to be on site but must be reachable by phone or electronically when you see patients.",
    otherConditions: [
      'Written practice agreement signed by PA and physician',
      'Schedule II–III need practice agreement or patient-specific order',
    ],
    citation: 'Cal. Bus. & Prof. Code §3501(f), §3502(c), §3516; 16 CCR §1399.545',
    sourceUrl:
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=3501',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'FL',
    role: 'NP',
    licensePath: 'APRN (supervisory protocol) or Autonomous APRN',
    board: 'Florida Board of Nursing; Board of Medicine',
    collaborationRequired: {
      status: 'TRANSITION_PERIOD',
      detail: 'Primary care: autonomous after 3,000 supervised hours; other specialties always',
    },
    remotePhysician: {
      status: 'LIMITED',
      detail: 'Yes, but a physician can oversee only 4 off-site offices (2 specialty)',
    },
    inPersonMeetings: { status: 'NOT_SPECIFIED', detail: null },
    chartReview: { status: 'NOT_SPECIFIED', detail: null },
    ratioLimit: {
      status: 'LIMIT',
      detail: 'No NP headcount cap; max 4 off-site offices (primary care)',
    },
    summary:
      'Remote physicians work in Florida: the physician need not be on site, but can oversee only a limited number of off-site offices. Primary-care NPs can go autonomous after 3,000 hours.',
    otherConditions: [
      'Written protocol kept at each practice location',
      'Schedule II prescriptions limited to 7-day supply (psychiatric nurses exempt)',
      'Dermatology offices must be within 25 miles or a contiguous county',
      "Office limits don't apply in hospitals, FQHCs, rural clinics, government facilities",
    ],
    citation: 'Fla. Stat. §464.012(3), §464.0123, §458.348(3); Fla. Admin. Code R. 64B9-4.001(14)',
    sourceUrl:
      'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0458/Sections/0458.348.html',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'FL',
    role: 'PA',
    licensePath: 'Licensed Physician Assistant (supervised)',
    board: 'Florida Board of Medicine / Board of Osteopathic Medicine',
    collaborationRequired: {
      status: 'REQUIRED',
      detail: 'Always required; no independent pathway',
    },
    remotePhysician: {
      status: 'LIMITED',
      detail: "Reachable by phone/video, but must be in 'reasonable physical proximity'",
    },
    inPersonMeetings: { status: 'NOT_SPECIFIED', detail: null },
    chartReview: {
      status: 'NOT_REQUIRED',
      detail: 'Law bars requiring chart review or cosignature',
    },
    ratioLimit: { status: 'LIMIT', detail: 'Max 10 PAs per physician' },
    summary:
      "Florida PAs can work with an off-site physician reachable by phone or video, but the rules require 'reasonable physical proximity' (undefined), so a physician in a distant region is risky.",
    otherConditions: [
      'Direct-supervision tasks need the physician on the premises',
      'Off-site offices capped: 4 primary care, 2 specialty',
      'Schedule II prescriptions limited to 7-day supply',
    ],
    citation: 'Fla. Stat. §458.347(2)(g), (4); Fla. Admin. Code R. 64B8-30.001(5)',
    sourceUrl:
      'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0458/Sections/0458.347.html',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IL',
    role: 'NP',
    licensePath: 'APRN (CNP) with written collaborative agreement',
    board: 'Illinois Department of Financial and Professional Regulation (IDFPR)',
    collaborationRequired: {
      status: 'TRANSITION_PERIOD',
      detail: 'Until Full Practice Authority: 4,000 clinical hours + 250 CE hours',
    },
    remotePhysician: { status: 'ALLOWED', detail: 'Yes; consultation in person or by phone/video' },
    inPersonMeetings: { status: 'NOT_REQUIRED', detail: null },
    chartReview: { status: 'NOT_SPECIFIED', detail: null },
    ratioLimit: { status: 'NONE', detail: null },
    summary:
      'Illinois lets a remote physician collaborate by phone or video with no on-site presence or in-person meetings required. NPs can drop the agreement after 4,000 hours plus 250 CE hours.',
    otherConditions: [
      'Not needed in hospitals or surgery centers where the NP has privileges',
      'Collaborating physician must hold an Illinois license',
      'Schedule II patients must be discussed with the physician monthly',
    ],
    citation: '225 ILCS 65/65-35, 65-43',
    sourceUrl: 'https://ilga.gov/Documents/legislation/ilcs/documents/022500650K65-35.htm',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IL',
    role: 'PA',
    licensePath: 'PA with written collaborative agreement',
    board: 'Illinois Department of Financial and Professional Regulation (IDFPR)',
    collaborationRequired: {
      status: 'REQUIRED',
      detail: 'Always, except in hospitals, FQHCs, or surgery centers with privileges',
    },
    remotePhysician: {
      status: 'ALLOWED',
      detail: 'Yes, except for procedures the agreement says need presence',
    },
    inPersonMeetings: {
      status: 'NOT_REQUIRED',
      detail: 'Monthly consultation, in person or by phone/video',
    },
    chartReview: {
      status: 'REQUIRED',
      detail: "Physician reviews PA's work and records at least monthly",
    },
    ratioLimit: { status: 'LIMIT', detail: 'Max 7 full-time PAs per physician' },
    summary:
      'Illinois PAs need a collaborating physician outside hospital or FQHC settings, but the physician can be remote, with monthly consultation and record review by phone or video.',
    otherConditions: [
      "Agreement must list procedures requiring the physician's presence",
      "PA may only treat the collaborating physicians' patients",
      'Controlled-substance patients discussed with the physician monthly',
    ],
    citation: '225 ILCS 95/7.5; 225 ILCS 60/54.5; 68 Ill. Adm. Code 1350.80',
    sourceUrl: 'https://ilga.gov/Documents/legislation/ilcs/documents/022500950K7.5.htm',
    lastVerified: PILOT_VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NY',
    role: 'NP',
    licensePath: 'Nurse Practitioner (NYSED certification)',
    board: 'NYSED Office of the Professions',
    collaborationRequired: {
      status: 'TRANSITION_PERIOD',
      detail: 'Written practice agreement until 3,600 hours, then not required (through June 2030)',
    },
    remotePhysician: { status: 'ALLOWED', detail: 'Yes; max 4 off-site NPs per physician' },
    inPersonMeetings: { status: 'NOT_SPECIFIED', detail: null },
    chartReview: {
      status: 'REQUIRED',
      detail: 'Record review at least every 3 months (under 3,600 hours)',
    },
    ratioLimit: { status: 'LIMIT', detail: 'Max 4 off-site NPs per physician' },
    summary:
      'Remote physicians work in New York. NPs under 3,600 hours need a written agreement with quarterly record review; experienced NPs need no physician through June 2030.',
    otherConditions: [
      "Collaborating physician must practice in the NP's specialty",
      'Agreement must cover referral, consultation, and emergency coverage',
      'Written practice protocols required under 3,600 hours',
      "Experienced NPs need 'collaborative relationships' again from July 2030 unless extended",
    ],
    citation: 'N.Y. Education Law §6902(3)',
    sourceUrl: 'https://www.nysenate.gov/legislation/laws/EDN/6902',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NY',
    role: 'PA',
    licensePath: 'Licensed Physician Assistant (NYSED)',
    board: 'NYSED Office of the Professions; NYS Department of Health',
    collaborationRequired: {
      status: 'REQUIRED',
      detail: 'Always required; continuous supervision',
    },
    remotePhysician: { status: 'ALLOWED', detail: 'Yes; physician need not be physically present' },
    inPersonMeetings: { status: 'NOT_SPECIFIED', detail: null },
    chartReview: { status: 'NOT_SPECIFIED', detail: null },
    ratioLimit: { status: 'LIMIT', detail: 'Max 6 PAs in private practice; no cap in hospitals' },
    summary:
      'A remote supervising physician works in New York. Supervision must be continuous, but the physician need not be physically present, and the law sets no chart-review quota or in-person meetings.',
    otherConditions: [
      "PA may only perform tasks within the supervising physician's scope",
      'PA must keep records documenting continuous supervision',
    ],
    citation: 'N.Y. Education Law §6542; 10 NYCRR §94.2',
    sourceUrl: 'https://www.nysenate.gov/legislation/laws/EDN/6542',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'TX',
    role: 'NP',
    licensePath: 'APRN (NP) with prescriptive authority agreement',
    board: 'Texas Board of Nursing; Texas Medical Board',
    collaborationRequired: {
      status: 'REQUIRED',
      detail: 'Required to prescribe (prescriptive authority agreement)',
    },
    remotePhysician: { status: 'ALLOWED', detail: 'Yes; no on-site requirement' },
    inPersonMeetings: {
      status: 'NOT_REQUIRED',
      detail: 'Monthly meetings, by video or phone allowed',
    },
    chartReview: { status: 'REQUIRED', detail: 'Number of charts set by physician and NP' },
    ratioLimit: {
      status: 'LIMIT',
      detail: 'Max 7 NPs/PAs combined (exempt in hospitals, underserved areas)',
    },
    summary:
      'Texas NPs need a prescriptive authority agreement with a physician to prescribe. The physician can be remote: monthly quality meetings may be by video or phone, plus chart review.',
    otherConditions: [
      'Schedule II only in hospitals or hospice',
      'Schedule III–V limited to 90 days; refills need physician consultation',
      'Agreement reviewed and signed at least annually',
    ],
    citation: 'Tex. Occ. Code §157.0512; 22 TAC §222.5',
    sourceUrl: 'https://statutes.capitol.texas.gov/Docs/OC/htm/OC.157.htm#157.0512',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'TX',
    role: 'PA',
    licensePath: 'PA with supervising physician',
    board: 'Texas Physician Assistant Board; Texas Medical Board',
    collaborationRequired: { status: 'REQUIRED', detail: 'Always; continuous supervision' },
    remotePhysician: { status: 'ALLOWED', detail: 'Yes; must be easily reachable by phone' },
    inPersonMeetings: {
      status: 'NOT_REQUIRED',
      detail: 'Monthly meetings (if prescribing), by video or phone allowed',
    },
    chartReview: { status: 'REQUIRED', detail: 'Number of charts set by physician and PA' },
    ratioLimit: {
      status: 'LIMIT',
      detail: 'Max 7 PAs/NPs combined (exempt in hospitals, underserved areas)',
    },
    summary:
      "Texas PAs always need a supervising physician, but the physician doesn't need to be on site as long as they're easily reachable by phone. Monthly quality meetings can be virtual.",
    otherConditions: [
      'Supervising physician must be named with the PA Board',
      'Schedule II only in hospitals or hospice',
      'Supervising physician keeps legal responsibility for patient care',
    ],
    citation: 'Tex. Occ. Code §204.204, §157.0512',
    sourceUrl: 'https://statutes.capitol.texas.gov/Docs/OC/htm/OC.204.htm#204.204',
    lastVerified: PILOT_VERIFIED,
    confidence: 'HIGH',
  },
]

export function getPhysicianOversightRules(state: string): PhysicianOversightRule[] {
  const code = state.trim().toUpperCase()
  return PHYSICIAN_OVERSIGHT_RULES.filter((r) => r.state === code)
}

const OCCUPATION_TO_ROLE: Record<string, PhysicianRole> = {
  'nurse practitioner': 'NP',
  'physician assistant': 'PA',
}

export function getPhysicianRoleForOccupation(
  occupationName: string | null | undefined,
): PhysicianRole | null {
  if (!occupationName) return null
  return OCCUPATION_TO_ROLE[occupationName.trim().toLowerCase()] ?? null
}
