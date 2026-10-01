import type { StateSupervisionRule } from './state-supervision-rules'

/**
 * Supervision-format rules for the 46 jurisdictions beyond the 5-state pilot
 * (45 states + DC), all six profession groups.
 *
 * Researched and then independently re-verified against primary sources
 * (statutes, administrative codes, board rules) on 2026-10-01. Entries a
 * reviewer adjusted after verification read "face-to-face" without a video
 * definition as NOT_SPECIFIED rather than NOT_ALLOWED, matching the pilot.
 */

const VERIFIED = '2026-10-01'

export const NATIONAL_SUPERVISION_RULES: StateSupervisionRule[] = [
  // ── AK ──
  {
    state: 'AK',
    profession: 'COUNSELING',
    licensePath: "Supervised post-master's applicant → LPC",
    board: 'Alaska Board of Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or over live video such as Zoom or Teams, with no cap on virtual hours.',
    conditions: [
      'Camera and microphone must stay on during video supervision',
      'At least 50 of 100 supervision hours must be one-on-one',
      'Supervisor must be a board-approved counselor supervisor',
    ],
    citation: '12 AAC 62.220(d)-(f); AS 08.29.110(a)(6)',
    sourceUrl:
      'https://www.akleg.gov/basis/aac.asp?media=print&secStart=12.62.010&secEnd=12.62.990',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AK',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Alaska Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or over any live electronic connection where you can both speak and hear at once, with no cap on virtual hours.',
    conditions: [
      'Supervision must be live, with both able to speak and hear at once',
      'No more than 50 of the 100 supervision hours in group',
      'Supervisor needs 3+ years licensed and 6 hours supervision training',
    ],
    citation: '12 AAC 18.115(a), (c)(3), (f); 12 AAC 18.113',
    sourceUrl:
      'https://www.akleg.gov/basis/aac.asp?media=print&secStart=12.18.010&secEnd=12.18.990',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AK',
    profession: 'MFT',
    licensePath: 'MFT Associate → LMFT',
    board: 'Alaska Board of Marital and Family Therapy',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Alaska rules allow approved supervisors to provide telesupervision, even as your only form of supervision, with no cap on virtual hours.',
    conditions: [
      'Supervisor must complete 4 hours of teletherapy training',
      'Supervisor must explain telesupervision risks to you in writing',
      'You must hold an MFT associate license before accruing Alaska hours',
    ],
    citation: '12 AAC 19.210(e); 12 AAC 19.200(f); AS 08.63.100(a)(3)(C)',
    sourceUrl:
      'https://www.akleg.gov/basis/aac.asp?media=print&secStart=12.19.010&secEnd=12.19.990',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AK',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral supervised experience → Psychologist',
    board: 'Alaska Board of Psychologist and Psychological Associate Examiners',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Alaska requires weekly individual face-to-face supervision but never says whether video counts, so confirm with the board before relying on video hours.',
    conditions: [
      'At least one hour per week of individual face-to-face supervision',
      'Each year: 1,500 hours over 10 to 24 months',
      'At least 80% supervised by a licensed or qualified psychologist',
    ],
    citation: '12 AAC 60.080(a)(2)-(4), (c); 12 AAC 60.400(d)',
    sourceUrl:
      'https://www.akleg.gov/basis/aac.asp?media=print&secStart=12.60.010&secEnd=12.60.990',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AK',
    profession: 'NP',
    licensePath: 'APRN (NP), independent practice',
    board: 'Alaska Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Alaska don't need a collaborating physician; you practice and prescribe independently, with no transition-to-practice hours.",
    conditions: [
      'No collaborative agreement or transition-to-practice hours required',
      'Separate board authorization needed to prescribe, including controlled substances',
      'Controlled-substance prescribers must register with the state PDMP',
    ],
    citation:
      'AS 08.68.850(1), (9); 12 AAC 44.380(a); 12 AAC 44.400(a)(6); 12 AAC 44.440; 12 AAC 44.445(d), (i)',
    sourceUrl: 'https://www.commerce.alaska.gov/web/Portals/5/pub/NursingStatutes.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AK',
    profession: 'PA',
    licensePath: 'PA with written collaborative agreement (exempt at certain facilities)',
    board: 'Alaska State Medical Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      "Board rules require 4-hour in-person visits with the collaborating physician quarterly during a plan's first two years, then twice yearly.",
    summary:
      'Your collaborating physician can be remote, but board rules still require 4-hour in-person visits quarterly (twice yearly after two years) unless you work at an exempt facility.',
    conditions: [
      '4-hour in-person visits quarterly for two years, then twice yearly',
      'At least monthly phone/electronic contact with chart review',
      'No agreement needed at licensed facilities, FQHCs, RHCs, tribal/federal sites',
    ],
    citation:
      'AS 08.64.107(c)-(d) (repealed and reenacted by sec. 2, ch. 21 SLA 2026 (SB 89), eff. 9/16/2026); 12 AAC 40.410; 12 AAC 40.415; 12 AAC 40.430(e)-(j)',
    sourceUrl: 'https://www.commerce.alaska.gov/web/portals/5/pub/MedicalStatutes.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── AL ──
  {
    state: 'AL',
    profession: 'COUNSELING',
    licensePath: 'ALC → LPC',
    board: 'Alabama Board of Examiners in Counseling',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'At least 25 of the 50 annual direct supervision hours must be individual and in person; the other 25 can be virtual only if the supervisor has completed virtual-supervision training.',
    summary:
      'At least 25 of your 50 yearly direct supervision hours must be in person; the other 25 can be by video if your supervisor has virtual-supervision training.',
    conditions: [
      'Supervisor must complete 2 CE hours in virtual supervision',
      'If the supervisor is untrained, all 50 direct hours must be in person',
      'Supervision plan (PPoS) must be filed with the board',
    ],
    citation: 'Ala. Admin. Code r. 255-X-3-.02(4); 255-X-3-.03(2)',
    sourceUrl: 'https://admincode.legislature.state.al.us/api/chapter/255-X-3',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AL',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LICSW',
    board: 'Alabama State Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Secure video supervision can count with no set cap, but the board favors substantial in-person time and must approve your supervision plan first.',
    conditions: [
      'Board must approve the supervision plan before supervision begins',
      'Plan must describe modalities and list one-on-one in-person hours',
      'Clinical supervisor must be an LICSW',
    ],
    citation: 'Ala. Admin. Code r. 850-X-3-.04(2)(i), (j); 850-X-3-.05(1)(e)',
    sourceUrl: 'https://admincode.legislature.state.al.us/api/chapter/850-X-3',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AL',
    profession: 'MFT',
    licensePath: 'LMFT Associate (LAMFTA) → LMFT',
    board: 'Alabama Board of Examiners in Marriage and Family Therapy',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live two-way video with an approved MFT supervisor trained in telesupervision, and the current rules set no cap on video hours.',
    conditions: [
      'Video must be simultaneously interactive both visually and orally',
      'Supervisor: AAMFT/ABEMFT Approved Supervisor or Candidate trained in telesupervision',
      'Board must approve the supervision contract',
    ],
    citation:
      'Ala. Admin. Code r. 536-X-1-.01(12)(b); 536-X-2-.05; 536-X-8-.09(9); 536-X-8-.10(19)(g)',
    sourceUrl: 'https://admincode.legislature.state.al.us/api/chapter/536-X-1',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AL',
    profession: 'PSYCHOLOGY',
    licensePath: 'Doctoral internship → Licensed Psychologist',
    board: 'Alabama Board of Examiners in Psychology',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Alabama requires no postdoctoral supervision, and its internship rule calls for face-to-face supervision without saying whether video counts, so confirm with the board.',
    conditions: [
      'No postdoctoral supervised experience is required for licensure',
      'Non-accredited internships need 2+ hours a week of face-to-face individual supervision',
      'APA/CPA-accredited internships meet the requirement automatically',
    ],
    citation: 'Ala. Admin. Code r. 750-X-2-.01, 750-X-2-.07(2)(g)',
    sourceUrl: 'https://admincode.legislature.state.al.us/api/chapter/750-X-2',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AL',
    profession: 'NP',
    licensePath: 'CRNP with BME/BON-approved collaborative practice agreement',
    board: 'Alabama Board of Nursing and Alabama Board of Medical Examiners (Joint Committee)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Physician must be present for 10% of your scheduled hours until you have 4,000 hours, visit each remote site twice a year, and meet with you quarterly after 4,000 hours.',
    summary:
      'Your collaborating physician can work mostly remotely, but must be on site 10% of your hours until you reach 4,000 hours and visit remote sites twice yearly.',
    conditions: [
      'Under 4,000 hours: physician present 10% of scheduled hours',
      'Remote sites visited twice yearly; quarterly meetings after 4,000 hours',
      'Quarterly quality assurance; physician cap of 360 hours/week (9 FTEs)',
    ],
    citation:
      'Ala. Admin. Code r. 610-X-5-.09(5) and r. 540-X-8-.08; Code of Ala. 1975 §34-21-80 et seq.',
    sourceUrl: 'https://admincode.legislature.state.al.us/api/chapter/610-X-5',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AL',
    profession: 'PA',
    licensePath: 'PA licensed by BME with approved registration (supervision) agreement',
    board: 'Alabama Board of Medical Examiners',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'At remote sites the physician must be present 10% of your hours until you have 4,000 hours, then visit twice a year and meet with you quarterly.',
    summary:
      'Your supervising physician can be remote, but must be on site 10% of your hours until you reach 4,000 hours, then visit twice yearly.',
    conditions: [
      'Daily status report to the physician from remote sites',
      'Under 4,000 hours: physician present 10% at remote site',
      'Quarterly meetings and quality assurance; physician cap of 360 hours/week',
    ],
    citation: 'Ala. Admin. Code r. 540-X-7-.23(9)-(10); Code of Ala. 1975 §34-24-290 et seq.',
    sourceUrl: 'https://admincode.legislature.state.al.us/api/chapter/540-X-7',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── AR ──
  {
    state: 'AR',
    profession: 'COUNSELING',
    licensePath: 'LAC → LPC',
    board: 'Arkansas Board of Examiners in Counseling',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by telemedicine (live video), and the current rule (effective July 9, 2026) sets no cap on virtual hours.',
    conditions: [
      '175 supervision hours across 3,000 client contact hours',
      'Supervisor must be a Board-approved LPC supervisor',
      'Group supervision capped at half of the 175 hours',
    ],
    citation: '17 CAR § 75-401(a), (f), (i)(1), (j)',
    sourceUrl:
      'https://codeofarrules.arkansas.gov/Rules/Rule?levelType=section&titleID=17&chapterID=246&subChapterID=303&partID=1152&subPartID=5873&sectionID=38352',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AR',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Arkansas Social Work Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Arkansas rules recognize supervision delivered through technology and set no cap on virtual hours, so secure video supervision can count toward your LCSW.',
    conditions: [
      '100 direct supervision hours over 24 months/4,000 hours',
      'No more than 2 supervision hours counted per week',
      'Group supervision (max 4) capped at half of total',
    ],
    citation: '17 CAR § 100-106(c)(3)-(5)',
    sourceUrl:
      'https://codeofarrules.arkansas.gov/Rules/Rule?levelType=section&titleID=17&chapterID=171&subChapterID=214&partID=767&subPartID=4190&sectionID=26186',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AR',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board: 'Arkansas Board of Examiners in Counseling',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by telemedicine (live video), and the current rule (effective July 9, 2026) sets no cap on virtual hours.',
    conditions: [
      '175 supervision hours across 3,000 client contact hours',
      'Supervisor must be a Board-approved LMFT supervisor',
      '1,000 direct hours must be family/relational/group therapy',
    ],
    citation: '17 CAR § 75-401(b), (f), (j), (k)',
    sourceUrl:
      'https://codeofarrules.arkansas.gov/Rules/Rule?levelType=section&titleID=17&chapterID=246&subChapterID=303&partID=1152&subPartID=5873&sectionID=38352',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AR',
    profession: 'PSYCHOLOGY',
    licensePath: 'Provisional Licensee → Licensed Psychologist',
    board: 'Arkansas Psychology Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your weekly postdoctoral supervision must be face-to-face, and the Board has advised that live video counts, though the rule itself never defines face-to-face.',
    conditions: [
      '2,000 postdoctoral hours with provisional license first',
      'At least 1 hour/week of formal face-to-face supervision',
      'Board advised in 2023 that phone supervision does not count',
    ],
    citation: '17 CAR § 95-404(h)(3), (h)(6); § 95-502(c)(2)(A); APB minutes Apr. 21, 2023',
    sourceUrl:
      'https://psychologyboard.arkansas.gov/wp-content/uploads/2023/09/04-April-Minutes-final-web_2023.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AR',
    profession: 'NP',
    licensePath:
      'APRN (CNP) with collaborative practice agreement for prescriptive authority, or full independent practice certificate',
    board: 'Arkansas State Board of Nursing; Full Independent Practice Credentialing Committee',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be available in person or by phone or electronically, and after 6,240 hours you can apply for full independent practice without one.',
    conditions: [
      'Physician needs an Arkansas medical license and comparable training or specialty',
      'Agreement covers availability, prescribing protocols, emergency coverage, quality assurance',
      '6,240 practice hours qualify you for full independent practice',
    ],
    citation:
      'Ark. Code Ann. §§ 17-87-102(2), 17-87-310, 17-87-314; 17 CAR §§ 123-601, 123-702, 130-201; ASBN Collaborative Practice Agreement form (rev. 6/2025)',
    sourceUrl:
      'https://healthy.arkansas.gov/wp-content/uploads/CollaborativePracticeAgreement6.2025.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AR',
    profession: 'PA',
    licensePath: 'PA license with Board-approved delegation agreement with supervising physician',
    board: 'Arkansas State Medical Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can be remote, as long as they or a back-up physician are available for immediate phone contact whenever you see patients.',
    conditions: [
      'Board-approved delegation agreement listing geographic range and supervision frequency',
      'Supervising or back-up physician available for immediate telephone contact',
      "Copy of delegation agreement kept at PA's practice location",
    ],
    citation:
      'Ark. Code Ann. §§ 17-105-101(5), 17-105-109, 17-105-110; Ark. State Medical Board Rule No. 24',
    sourceUrl: 'https://armedicalboard.adh.arkansas.gov/professionals/pdf/mpa.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── AZ ──
  {
    state: 'AZ',
    profession: 'COUNSELING',
    licensePath: 'LAC → LPC',
    board: 'Arizona Board of Behavioral Health Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by live video with no cap on video hours; only phone supervision is limited, to 15 hours.',
    conditions: [
      'Phone-only supervision counts for no more than 15 hours',
      'Each session must last at least 30 minutes',
      '10 hours must be observation; live video is fine for these',
    ],
    citation: 'A.A.C. R4-6-212(E); R4-6-101(12); R4-6-504',
    sourceUrl: 'https://apps.azsos.gov/public_services/Title_04/4-06.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AZ',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Arizona Board of Behavioral Health Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by live video with no cap on video hours; only phone supervision is limited, to 15 hours.',
    conditions: [
      'At least 50 of 100 hours supervised by a Board-licensed LCSW',
      'Phone-only supervision counts for no more than 15 hours',
      'Each session must last at least 30 minutes',
    ],
    citation: 'A.A.C. R4-6-212(E); R4-6-101(12); R4-6-404',
    sourceUrl: 'https://apps.azsos.gov/public_services/Title_04/4-06.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AZ',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board: 'Arizona Board of Behavioral Health Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by live video with no cap on video hours; only phone supervision is limited, to 15 hours.',
    conditions: [
      'At least 50 of 100 hours by an LMFT or AAMFT Approved Supervisor',
      'Phone-only supervision counts for no more than 15 hours',
      'Each session must last at least 30 minutes',
    ],
    citation: 'A.A.C. R4-6-212(E); R4-6-101(12); R4-6-604',
    sourceUrl: 'https://apps.azsos.gov/public_services/Title_04/4-06.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AZ',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral trainee → Licensed Psychologist',
    board: 'Arizona Board of Psychologist Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Individual supervision can be in person or over secure real-time video; audio-only supervision can make up no more than half of it.',
    conditions: [
      'Video supervision must be secure, confidential, and real-time',
      'At least 1 hour of individual supervision per 20 hours worked',
      'At least 50% of individual supervision in person or by video',
    ],
    citation: 'A.R.S. §32-2071(F)(6), (G)(5); A.R.S. §32-2061(15); A.A.C. R4-26-111(A)',
    sourceUrl: 'https://apps.azsos.gov/public_services/Title_04/4-26.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AZ',
    profession: 'NP',
    licensePath: 'Registered Nurse Practitioner (RNP), independent practice',
    board: 'Arizona State Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a collaborating physician in Arizona; you can practice and prescribe independently, with no transition-to-practice hours required.",
    conditions: [
      'Board RNP certification plus national NP certification required',
      'Consult or refer when a case exceeds your knowledge',
      'Controlled-substance prescribing requires meeting Board requirements',
    ],
    citation: 'A.R.S. § 32-1601(23)',
    sourceUrl: 'https://www.azleg.gov/ars/32/01601.htm',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'AZ',
    profession: 'PA',
    licensePath:
      'PA with supervision agreement (<8,000 hrs) or collaborative practice (8,000+ hrs)',
    board: 'Arizona Regulatory Board of Physician Assistants',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can supervise you remotely through electronic means, and once the board certifies your 8,000 clinical hours you no longer need a supervision agreement.',
    conditions: [
      'Under 8,000 hours: written or electronic signed supervision agreement required',
      'Physician may supervise at most six PAs working at once',
      'Supervisor must track and review your Schedule II/III prescriptions',
    ],
    citation: 'A.R.S. §§ 32-2501, 32-2531(B)-(C), 32-2533, 32-2536',
    sourceUrl: 'https://www.azleg.gov/ars/32/02531.htm',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── CO ──
  {
    state: 'CO',
    profession: 'COUNSELING',
    licensePath: 'LPCC (Licensed Professional Counselor Candidate) → LPC',
    board: 'Colorado State Board of Licensed Professional Counselor Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by telesupervision (live video), with no cap on virtual hours.',
    conditions: [
      '50 supervision hours per 1,000 practice hours',
      'At least 25 of each 50 hours must be individual',
      'Remaining hours may be triadic or group (max 1:10)',
    ],
    citation: '4 CCR 737-1, Rule 1.14(C)(1)(e),(g) and (C)(4)(b)-(c)',
    sourceUrl:
      'https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=12132&fileName=4%20CCR%20737-1',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CO',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSW / Social Work Candidate → LCSW',
    board: 'Colorado State Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your clinical supervision can be in person or virtual (live video), with no cap on virtual hours.',
    conditions: [
      '96 total supervision hours required',
      'At least 48 hours must be individual supervision',
      'Hours must be reasonably distributed across the supervised experience',
    ],
    citation: '4 CCR 726-1, Rule 1.14(C)(1)(e),(g) and (C)(5)(a)',
    sourceUrl:
      'https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=12110&fileName=4%20CCR%20726-1',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CO',
    profession: 'MFT',
    licensePath: 'MFTC (Marriage and Family Therapist Candidate) → LMFT',
    board: 'Colorado State Board of Marriage and Family Therapist Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Both individual and group supervision can be in person or by telesupervision (live video), with no cap on virtual hours.',
    conditions: [
      '50 supervision hours per 1,000 practice hours',
      'At least 25 of each 50 hours must be individual',
      'Remaining hours may be group supervision',
    ],
    citation: '4 CCR 736-1, Rule 1.14(C)(1)(e) and (C)(6)(a)',
    sourceUrl:
      'https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=12271&fileName=4%20CCR%20736-1',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CO',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychologist Candidate (post-doctoral) → Licensed Psychologist',
    board: 'Colorado State Board of Psychologist Examiners',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Colorado requires 50 face-to-face individual supervision hours but never says whether live video counts, so confirm with the board before relying on video hours.',
    conditions: [
      '75 supervision hours over at least 12 months',
      'At least 50 hours face-to-face individual supervision',
      'Remaining hours may only be group supervision',
    ],
    citation: '3 CCR 721-1, Rule 1.14(C)(1)(e) and (C)(5)(a)-(b)',
    sourceUrl:
      'https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=12526&fileName=3%20CCR%20721-1',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'CO',
    profession: 'NP',
    licensePath:
      'APRN (NP) with independent practice; provisional then full prescriptive authority',
    board: 'Colorado State Board of Nursing (DORA Division of Professions and Occupations)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Colorado don't need a collaborating physician; to prescribe, you complete a 750-hour mentorship, which can be done remotely by live phone or video.",
    conditions: [
      '750-hour prescribing mentorship after provisional prescriptive authority',
      'Mentor: Colorado-practicing physician or full-authority APRN; finish within 3 years',
      "Remote mentoring must be synchronous; email doesn't count",
    ],
    citation: 'C.R.S. 12-255-112(4)(b)(I); 3 CCR 716-1, Rule 1.15',
    sourceUrl: 'https://colorado.public.law/statutes/crs_12-255-112',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CO',
    profession: 'PA',
    licensePath: 'PA with collaborative agreement (supervisory agreement under 5,000 hours)',
    board: 'Colorado Medical Board (DORA Division of Professions and Occupations)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      "Physician must practice in Colorado with a regular physical presence; out-of-state physicians can't collaborate.",
    summary:
      'Your collaborating physician can work with you remotely, even in your first 160 hours, but must practice in Colorado with a regular physical presence there.',
    conditions: [
      'Under 5,000 hours (3,000 in new area): supervisory agreement required',
      'Performance evaluations at 6 and 12 months, then as physician decides',
      "Physician practicing mainly by telehealth doesn't count as practicing in Colorado",
    ],
    citation: 'C.R.S. 12-240-114.5(2)(a), (2)(b)(I); 3 CCR 713-1, Rule 1.15(C)(3)(a)',
    sourceUrl: 'https://colorado.public.law/statutes/crs_12-240-114.5',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── CT ──
  {
    state: 'CT',
    profession: 'COUNSELING',
    licensePath: 'LPC Associate → LPC',
    board: 'Connecticut Department of Public Health (Professional Counselor licensure)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Connecticut requires face-to-face supervision but never says whether live video counts as face-to-face, so confirm with DPH before relying on video hours.',
    conditions: [
      '3,000 postgraduate hours over at least two years',
      'At least 100 hours of direct one-on-one supervision',
      'At least monthly review with written evaluation',
    ],
    citation: 'Conn. Gen. Stat. §§20-195aa(7), 20-195dd(a)(2)',
    sourceUrl: 'https://www.cga.ct.gov/current/pub/chap_383c.htm',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'CT',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Connecticut Department of Public Health (Clinical Social Work licensure)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Connecticut requires face-to-face supervision but does not say whether live video qualifies, so confirm with DPH before counting video hours.',
    conditions: [
      "3,000 post-master's hours, at least 100 under professional supervision",
      'Connecticut hours must be earned while licensed as an LMSW',
      'Supervisor must be an LCSW; one-on-one, at least monthly',
    ],
    citation: 'Conn. Gen. Stat. §§20-195m(8), 20-195n(c)(2)',
    sourceUrl: 'https://www.cga.ct.gov/current/pub/chap_383b.htm',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'CT',
    profession: 'MFT',
    licensePath: 'LMFT Associate → LMFT',
    board: 'Connecticut Department of Public Health (Marital and Family Therapist licensure)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "Connecticut rules require supervisors to be 'sitting face to face' with you, which suggests in person, but video is not addressed, so confirm with DPH first.",
    conditions: [
      '100 supervision hours from an LMFT within 24 months of postgraduate experience',
      'At least 50 individual hours (one supervisor, one or two supervisees)',
      'Group supervision: no more than six supervisees',
    ],
    citation: 'Conn. Gen. Stat. §20-195c(a)(3); Regs. Conn. State Agencies §20-195a-3(b)',
    sourceUrl:
      'https://www.law.cornell.edu/regulations/connecticut/Regs-Conn-State-Agencies-SS-20-195a-3',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'CT',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral trainee → Licensed Psychologist',
    board: 'Connecticut Department of Public Health / Board of Examiners of Psychologists',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'At least one of every three weekly supervision hours must be individual and face-to-face, and the rules do not say whether video qualifies, so confirm with DPH first.',
    conditions: [
      'One year of experience: 1,800 hours within 24 months, or the 35-hour-week option',
      '3 supervision hours per 40 worked; at least 1 individual, face-to-face',
      'Supervisor must be a licensed doctoral psychologist with three or fewer supervisees',
    ],
    citation: 'Conn. Gen. Stat. §20-188; Regs. Conn. State Agencies §20-188-3(b)',
    sourceUrl:
      'https://www.law.cornell.edu/regulations/connecticut/Regs-Conn-State-Agencies-SS-20-188-3',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'CT',
    profession: 'NP',
    licensePath: 'APRN (NP) with collaborative agreement for first 3 years/2,000 hours',
    board: 'Connecticut State Board of Examiners for Nursing / Department of Public Health',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote, and after 3 years and 2,000 collaborative hours you may practice without one.',
    conditions: [
      'Collaboration required for first 3 years and 2,000 hours',
      'Written agreement for prescribing, including Schedule II/III limits',
      'Notify DPH Commissioner before independent practice; keep documentation 3 years',
    ],
    citation: 'Conn. Gen. Stat. § 20-87a(b)(2)-(3)',
    sourceUrl: 'https://www.cga.ct.gov/current/pub/chap_378.htm',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'CT',
    profession: 'PA',
    licensePath: 'PA with supervising physician and written delegation agreement',
    board: 'Connecticut Medical Examining Board / Department of Public Health',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can be remote if they stay reachable by phone or telecommunications and regularly review your work and charts.',
    conditions: [
      'Written delegation agreement, reviewed by physician at least annually',
      'Physician documents approval of your Schedule II/III prescriptions',
      'Temporary-permit holders need the physician physically on the premises',
    ],
    citation: 'Conn. Gen. Stat. §§ 20-12a(7)(B), 20-12b(b), 20-12c, 20-12d(a)',
    sourceUrl: 'https://www.cga.ct.gov/current/pub/chap_370.htm',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── DC ──
  {
    state: 'DC',
    profession: 'COUNSELING',
    licensePath: 'LGPC → LPC',
    board: 'DC Board of Professional Counseling',
    remoteStatus: 'NOT_ALLOWED',
    remoteLimit: null,
    summary:
      'Your 200 required supervision hours must be in person with your supervisor physically present; video only counts for day-to-day availability, not supervision hours.',
    conditions: [
      '200 hours immediate supervision; 100 must be individual',
      'At least 1 supervision hour per 35 hours worked',
      '100 hours must be with a licensed professional counselor',
    ],
    citation: '17 DCMR §§ 6603.1(c), 6699; § 9102.2',
    sourceUrl: 'https://dcregs.dc.gov/Common/DCMR/SectionList.aspx?SectionNumber=17-6699',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'DC',
    profession: 'SOCIAL_WORK',
    licensePath: 'LGSW → LICSW',
    board: 'DC Board of Social Work',
    remoteStatus: 'NOT_ALLOWED',
    remoteLimit: null,
    summary:
      'Your required immediate supervision (1 hour per 32 practice hours) must be in person; video and phone count only for daily check-ins, not supervision hours.',
    conditions: [
      '1 hour immediate supervision per 32 hours of practice',
      '3,000 hours over 2–4 years under an LICSW',
      'Off-site supervisor 2+ days a week needs a written contract',
    ],
    citation: '17 DCMR §§ 7012.8, 7012.9, 7099; D.C. Code § 3-1208.04; Board Policy 25-001',
    sourceUrl: 'https://dcregs.dc.gov/Common/DCMR/SectionList.aspx?SectionNumber=17-7099',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'DC',
    profession: 'MFT',
    licensePath: 'MFT graduate (supervised) → LMFT',
    board: 'DC Board of Professional Counseling (regulates MFT since July 19, 2024)',
    remoteStatus: 'NOT_ALLOWED',
    remoteLimit: null,
    summary:
      "Your MFT supervision must be in-person, face-to-face meetings with your supervisor, so video sessions don't count toward the required supervisory contact hours.",
    conditions: [
      '1 supervision hour per 20 direct client contact hours',
      'At least monthly face-to-face discussions with supervisor',
      '2,000 supervised hours, 1,000 in-person direct client contact',
    ],
    citation: '17 DCMR §§ 7703.3, 7799; D.C. Code § 3-1202.13',
    sourceUrl: 'https://dcregs.dc.gov/Common/DCMR/SectionList.aspx?SectionNumber=17-7799',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'DC',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychology Associate → Psychologist',
    board: 'DC Board of Psychology',
    remoteStatus: 'LIMITED',
    remoteLimit: 'At least 10% of supervised practice hours must be under in-person supervision.',
    summary:
      'At least 10% of your practice hours must be under in-person supervision; otherwise your supervisor must be reachable and able to get on site within two hours.',
    conditions: [
      '10% of the 4,000 hours under in-person immediate supervision',
      'Primary supervisor must be a DC-licensed psychologist',
      'Supervisor must be able to get on site within 2 hours',
    ],
    citation: '17 DCMR §§ 6902.1(c), 6902.5, 6911.1, 6911.6, 6999',
    sourceUrl: 'https://dcregs.dc.gov/Common/DCMR/SectionList.aspx?SectionNumber=17-6999',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'DC',
    profession: 'NP',
    licensePath: 'APRN (certified nurse-practitioner), independent practice',
    board: 'DC Board of Nursing (DC Health)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "In DC you don't need a collaborating physician as an NP, because the law defines APRN practice as independent, so the question of remote oversight doesn't arise.",
    conditions: [
      'Hold national certification in an APRN role and population focus',
      'Former collaboration section (D.C. Code 3-1206.03) repealed July 19, 2024',
      'Facility credentialing or privileging can still apply',
    ],
    citation:
      'D.C. Code § 3-1201.02(2); § 3-1206.01; § 3-1206.03 (repealed by D.C. Law 25-191, § 101(ww)); § 3-1206.04',
    sourceUrl: 'https://code.dccouncil.gov/us/dc/council/code/sections/3-1201.02',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'DC',
    profession: 'PA',
    licensePath: 'PA with a written delegation agreement with a supervising physician',
    board: 'DC Board of Medicine (Advisory Committee on Physician Assistants)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Outpatient: remote OK with constant electronic availability. Inpatient: physician must be physically present continuously or intermittently.',
    summary:
      'Your supervising physician can be fully remote in outpatient settings if constantly reachable electronically, but inpatient work requires their continuing or intermittent physical presence.',
    conditions: [
      'Supervising physician must be DC-licensed and sign the delegation agreement',
      'Quarterly practice advisory review with a supervising physician, documented on file',
      'Physician may actively supervise at most 4 on-duty PAs at once',
    ],
    citation: 'D.C. Code § 3-1201.02(13); 17 DCMR § 4914 (as amended 67 DCR 2795, Mar. 13, 2020)',
    sourceUrl:
      'https://dcregs.dc.gov/Common/DCMR/RuleList.aspx?DownloadFile={34390584-7B06-4C7A-8AE9-4FD35BB54041}',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── DE ──
  {
    state: 'DE',
    profession: 'COUNSELING',
    licensePath: 'LACMH → LPCMH',
    board: 'Delaware Board of Mental Health and Chemical Dependency Professionals',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary: 'Your supervision can be in person or by live video, with no cap on video hours.',
    conditions: [
      'At least 100 hours of face-to-face, individual direct supervision',
      'No more than 40 of the 100 hours may be group supervision',
      'Supervisor must meet Board qualifications in subsections 2.5–2.5.3',
    ],
    citation: '24 DE Admin. Code 3000-2.3.1, 2.4.1.3 (30 DE Reg. 46, July 2026)',
    sourceUrl:
      'https://regulations.delaware.gov/register/july2026/final/30%20DE%20Reg%2046%2007-01-26',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'DE',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Delaware Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "All of your direct supervision can be by live video if your supervisor agrees, but phone and email supervision don't count.",
    conditions: [
      "Video use is at the supervisor's discretion",
      'At least 75 of the 100 direct supervision hours must be one-to-one',
      'Telephone or email supervision is not permitted',
    ],
    citation: '24 DE Admin. Code 3900-3.1.3 (30 DE Reg. 51, July 2026)',
    sourceUrl:
      'https://regulations.delaware.gov/register/july2026/final/30%20DE%20Reg%2051%2007-01-26',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'DE',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board: 'Delaware Board of Mental Health and Chemical Dependency Professionals',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your live video supervision should count as face-to-face since Delaware dropped its 50% video cap, but confirm with the Board because the MFT rule doesn't mention video.",
    conditions: [
      '100 hours of face-to-face clinical supervision required',
      'Supervisor must meet subsection 6.3.1 (e.g., DE LMFT licensed 2+ years)',
      'A non-LMFT supervisor needs Board approval on the Request for Alternative Supervisor form',
    ],
    citation: '24 DE Admin. Code 3000-5.1.2.1.4; 28 DE Reg. 467 (Dec 2024)',
    sourceUrl:
      'https://regulations.delaware.gov/register/december2024/final/28%20DE%20Reg%20467%2012-01-24.htm',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'DE',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychological Assistant (postdoc) → Licensed Psychologist',
    board: 'Delaware Board of Examiners of Psychologists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video counts as face-to-face, but your supervisor must be employed or contracted at your practice setting.',
    summary:
      "Live video counts as face-to-face supervision, but your supervisor must work in your practice setting, so outside remote-only supervisors generally won't qualify.",
    conditions: [
      'At least 1 hour of face-to-face supervision per 10 clinical hours',
      'Must register as a psychological assistant before starting postdoc work in DE',
      'Weekly one-on-one supervision; group supervision only with Board approval',
    ],
    citation: '24 DE Admin. Code 3500-7.2, 7.3, 9.2.1 (29 DE Reg. 797, Mar 2026)',
    sourceUrl:
      'https://regulations.delaware.gov/register/march2026/final/29%20DE%20Reg%20797%2003-01-26',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'DE',
    profession: 'NP',
    licensePath: 'APRN (CNP) with full practice authority',
    board: 'Delaware Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Delaware don't need a collaborating physician. Full practice authority comes with your APRN license, and there are no transition-to-practice hours.",
    conditions: [
      'No collaborative agreement or transition hours required since HB 141 (2021)',
      'Must hold active Delaware RN and APRN licenses, including for telehealth',
      'Employers may still require a collaborative agreement',
    ],
    citation:
      '24 Del. C. § 1935(a)(1), (b), (f); § 1936 repealed by 83 Del. Laws c. 111, § 2 (HB 141), eff. Aug. 4, 2021',
    sourceUrl: 'https://delcode.delaware.gov/title24/c019/index.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'DE',
    profession: 'PA',
    licensePath:
      'Physician Associate (PA) with collaborative agreement; independent practice after 6,000 hours',
    board:
      'Delaware Board of Medical Licensure and Discipline; Regulatory Council for Physician Associates',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote if reachable electronically during patient encounters; independent practice for 6,000+ hour PAs starts by May 12, 2027 at the latest.',
    conditions: [
      'A physician may collaborate with at most 4 PAs (same-building exemption)',
      'Written collaborative agreement kept on file at your primary practice location',
      '6,000+ hours: Council independent-practice route, implemented by May 12, 2027',
    ],
    citation:
      '24 Del. C. §§ 1770A(2), 1771(b), (f), (i), 1772(e), (i)-(j), as amended by 85 Del. Laws c. 253 (HB 325, approved May 12, 2026), § 23',
    sourceUrl: 'https://delcode.delaware.gov/title24/c017/sc06/index.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── GA ──
  {
    state: 'GA',
    profession: 'COUNSELING',
    licensePath: 'APC → LPC',
    board:
      'Georgia Composite Board of Professional Counselors, Social Workers and Marriage and Family Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over secure video, with no cap on virtual hours, if your supervisor has completed telemental health supervision training.',
    conditions: [
      'Supervisor needs 9 CE hours in telemental health, including 3 on supervision',
      'Supervisor must get your verbal and written consent before video supervision',
      'Supervisor must still meet Rule 135-5 supervisor requirements',
    ],
    citation: 'Ga. Comp. R. & Regs. 135-11-.01; 135-5-.01, 135-5-.02',
    sourceUrl: 'https://rules.sos.ga.gov/gac/135-11',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'GA',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board:
      'Georgia Composite Board of Professional Counselors, Social Workers and Marriage and Family Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over secure video, with no cap on virtual hours, if your supervisor has completed telemental health supervision training.',
    conditions: [
      'Supervisor needs 9 CE hours in telemental health, including 3 on supervision',
      'Supervisor must get your verbal and written consent before video supervision',
      'Supervisor must still meet Rule 135-5-.04 supervisor requirements',
    ],
    citation: 'Ga. Comp. R. & Regs. 135-11-.01; 135-5-.03, 135-5-.04',
    sourceUrl: 'https://rules.sos.ga.gov/gac/135-11',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'GA',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board:
      'Georgia Composite Board of Professional Counselors, Social Workers and Marriage and Family Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over secure video, with no cap on virtual hours, if your supervisor has completed telemental health supervision training.',
    conditions: [
      'Supervisor needs 9 CE hours in telemental health, including 3 on supervision',
      'Supervisor must get your verbal and written consent before video supervision',
      'Supervisor must still meet Rule 135-5-.06 supervisor requirements',
    ],
    citation: 'Ga. Comp. R. & Regs. 135-11-.01; 135-5-.05, 135-5-.06',
    sourceUrl: 'https://rules.sos.ga.gov/gac/135-11',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'GA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral Fellow → Licensed Psychologist',
    board: 'Georgia State Board of Examiners of Psychologists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your postdoctoral supervision can be in person or by real-time video, with no cap on video hours, as long as it is individual supervision.',
    conditions: [
      'Postdoc supervision must be individual: 1 hour per 30 hours worked',
      'Supervision must happen the same week as the services or the week after',
      'Specialty internships require 2 weekly hours of in-person individual supervision',
    ],
    citation: 'Ga. Comp. R. & Regs. 510-2-.05(5)(b)(2)',
    sourceUrl: 'https://rules.sos.ga.gov/gac/510-2',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'GA',
    profession: 'NP',
    licensePath: 'APRN (NP) with Board-filed nurse protocol agreement',
    board:
      'Georgia Composite Medical Board (protocol); Georgia Board of Nursing (APRN authorization)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'The physician must practice in Georgia (or within 50 miles of your site if out of state) and observe your practice onsite at least once a year.',
    summary:
      'Your delegating physician can supervise you by phone, but must practice in Georgia or within 50 miles of your site, and observe you onsite yearly.',
    conditions: [
      'Physician documents direct onsite observation of your practice at least annually',
      'Physician examines controlled-substance patients at least quarterly',
      'Max combined equivalent of 8 APRNs/PAs per physician (since May 25, 2026)',
    ],
    citation:
      'O.C.G.A. § 43-34-25; Ga. Comp. R. & Regs. 360-32-.01(8), (11); 360-32-.02(2), (5)(d), (5)(h), (7); 360-32-.04; 360-32-.05(1)-(2)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/georgia/Ga-Comp-R-Regs-R-360-32-.01',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'GA',
    profession: 'PA',
    licensePath: 'PA with Board-approved supervising physician and job description',
    board: 'Georgia Composite Medical Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervising physician can be remote for tasks in your approved job description, as long as they're available for immediate consultation by phone or telecommunication.",
    conditions: [
      'Physician examines controlled-substance patients at least every three months',
      'Tasks outside your job description require the physician physically present',
      'Max combined equivalent of 8 APRNs/PAs per physician (since May 25, 2026)',
    ],
    citation:
      'O.C.G.A. §§ 43-34-102, 43-34-103; Ga. Comp. R. & Regs. 360-5-.04(3), 360-5-.05, 360-5-.11(1)-(2), 360-5-.12(7)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/georgia/Ga-Comp-R-Regs-R-360-5-.11',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── HI ──
  {
    state: 'HI',
    profession: 'COUNSELING',
    licensePath: 'Associate MHC → LMHC',
    board:
      'Hawaii DCCA Professional and Vocational Licensing Division (Mental Health Counselor Program)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Some or all of your 100 supervision hours can be by secure, HIPAA-compliant video, if you and your supervisor agree.',
    conditions: [
      'Video platform must be HIPAA-compliant',
      'Electronic supervision is elected jointly with your supervisor',
      "Check other states' rules if you may later seek endorsement",
    ],
    citation: 'HRS §453D-7(a)(2); §453D-7.5',
    sourceUrl:
      'https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0453D/HRS_0453D-0007.htm',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'HI',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSW → LCSW',
    board: 'Hawaii DCCA Professional and Vocational Licensing Division (Social Worker Program)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Some or all of your 100 supervision hours can be by secure, HIPAA-compliant video, with no cap on virtual hours.',
    conditions: [
      'At least 60 of 100 hours must be individual supervision',
      'Video platform must be HIPAA-compliant',
      "Check other states' endorsement rules before choosing video",
    ],
    citation: 'HRS §467E-7(a)(3)(C)-(E)',
    sourceUrl:
      'https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0467E/HRS_0467E-0007.htm',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'HI',
    profession: 'MFT',
    licensePath: 'Associate MFT → LMFT',
    board:
      'Hawaii DCCA Professional and Vocational Licensing Division (Marriage and Family Therapist Program)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Hawaii requires 200 hours of clinical supervision but does not say whether it must be in person. Confirm with DCCA before relying on video hours.',
    conditions: [
      '200 supervision hours and 1,000 direct MFT hours',
      'Must take at least 24 months',
      "Associates practice only under 'direct supervision' of the supervisor",
    ],
    citation: 'HRS §451J-7(3); §451J-7.2; §451J-1',
    sourceUrl:
      'https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0451J/HRS_0451J-0007.htm',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'HI',
    profession: 'PSYCHOLOGY',
    licensePath: 'Associate Psychologist / Postdoc → Psychologist',
    board: 'Hawaii Board of Psychology',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "Hawaii's psychology law and rules do not say whether postdoctoral supervision must be in person. Confirm with the Board of Psychology before relying on video hours.",
    conditions: [
      'One year (1,900 hours) of postdoctoral supervised experience',
      'Associates practice only under direct supervision of named psychologist',
      'Board has informally recommended some in-person supervision',
    ],
    citation: 'HRS §465-7(a)(2), §465-7.2; HAR §16-98-8(b)(2)',
    sourceUrl:
      'https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0465/HRS_0465-0007_0002.htm',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'HI',
    profession: 'NP',
    licensePath: 'APRN (NP) recognition with prescriptive authority, independent practice',
    board: 'Hawaii Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Hawaii don't need a collaborating physician, and there are no transition-to-practice hours to complete.",
    conditions: [
      'Needs APRN recognition and current national NP certification',
      'Board must grant prescriptive authority, which requires advanced pharmacology coursework',
      'No transition-to-practice hours or physician agreement required',
    ],
    citation: 'HRS §§457-2, 457-8.5, 457-8.6; HAR §§16-89-2, 16-89-81',
    sourceUrl: 'https://cca.hawaii.gov/wp-content/uploads/2026/02/HAR-89-C.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'HI',
    profession: 'PA',
    licensePath: 'PA license with supervising physician',
    board: 'Hawaii Medical Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervising physician can be remote. Hawaii says supervision needn't be in person, and phone or other telecommunication counts as direct communication.",
    conditions: [
      'Supervising physician may supervise at most four PAs at once',
      'New PAs: 50% chart review, then 25%, within 30 days',
      'After year one: at least 30 minutes of monthly record audit',
    ],
    citation: 'HRS §453-5.3(f)-(g); HAR §§16-85-44.5, 16-85-49(a)(4),(7)',
    sourceUrl: 'https://cca.hawaii.gov/wp-content/uploads/2026/02/har_85-c2-1-1.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── IA ──
  {
    state: 'IA',
    profession: 'COUNSELING',
    licensePath: 'Temporary LMHC → LMHC',
    board:
      'Iowa Board of Behavioral Health Professionals (Dept. of Inspections, Appeals, and Licensing)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your direct supervision can be in person or by videoconference, with no cap on video hours.',
    conditions: [
      'At least 110 direct supervision hours over two years',
      'No more than 50 hours of group supervision',
      'Submit a supervision plan to the board before starting',
    ],
    citation: '481 IAC 880.7(1)(e)',
    sourceUrl: 'https://www.legis.iowa.gov/docs/iac/chapter/481.880.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IA',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LISW',
    board:
      'Iowa Board of Behavioral Health Professionals (Dept. of Inspections, Appeals, and Licensing)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your direct supervision can be in person or by videoconference, with no cap on video hours.',
    conditions: [
      'At least 110 direct supervision hours over two years',
      'No more than 50 hours of group supervision',
      'Supervisor needs three years of independent practice plus supervision training',
    ],
    citation: '481 IAC 880.7(1)(e)',
    sourceUrl: 'https://www.legis.iowa.gov/docs/iac/chapter/481.880.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IA',
    profession: 'MFT',
    licensePath: 'Temporary LMFT → LMFT',
    board:
      'Iowa Board of Behavioral Health Professionals (Dept. of Inspections, Appeals, and Licensing)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your direct supervision can be in person or by videoconference, with no cap on video hours.',
    conditions: [
      'At least 110 direct supervision hours over two years',
      'No more than 50 hours of group supervision',
      'Submit a supervision plan to the board before starting',
    ],
    citation: '481 IAC 880.7(1)(e)',
    sourceUrl: 'https://www.legis.iowa.gov/docs/iac/chapter/481.880.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral resident (provisional license) → Licensed Psychologist',
    board:
      'Iowa Board of Behavioral Health Professionals (Dept. of Inspections, Appeals, and Licensing)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your weekly individual postdoctoral supervision can be in person or by videoconference, with no cap on video hours.',
    conditions: [
      'Individual supervision every week, at least 45 hours total',
      'Group supervision does not count toward the 45 hours',
      'Crisis plan required when the supervisor is not on site',
    ],
    citation: '481 IAC 880.8(2)(c)',
    sourceUrl: 'https://www.legis.iowa.gov/docs/iac/chapter/481.880.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IA',
    profession: 'NP',
    licensePath: 'ARNP (NP), independent practice; no physician agreement',
    board: 'Iowa Board of Nursing (Dept. of Inspections, Appeals, and Licensing)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Iowa don't need a collaborating physician. You can practice and prescribe independently, with no transition-to-practice hours required.",
    conditions: [
      'Hold active RN license plus current national NP certification',
      'Practice within your licensed population focus',
      'Controlled substances require Iowa CSA and DEA registrations',
    ],
    citation: '481 IAC 621.4(3)-(4) (formerly 655 IAC 7.4); Iowa Code ch. 152',
    sourceUrl: 'https://www.legis.iowa.gov/docs/iac/chapter/09-30-2026.481.621.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IA',
    profession: 'PA',
    licensePath: 'PA (physician associate); supervision only for new independent practices',
    board:
      'Iowa Board of Physician Associates (with Board of Medicine), Dept. of Inspections, Appeals, and Licensing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Most Iowa PAs don't need a supervising physician; if one is required (new independent practice), they can be remote, reviewing care by phone or telecommunication.",
    conditions: [
      "Supervision required only in own PC/PLLC with under 2 years' prior practice",
      'Afterward, collaboration set at practice level; document it',
      'Non-physician collaborators need 5+ years practice, no discipline',
    ],
    citation:
      'Iowa Code §148C.1(5), (8), §148C.3(2), §148C.4(3); 481 IAC 780.1, 780.4, 780.5, 780.7',
    sourceUrl: 'https://www.legis.iowa.gov/docs/iac/chapter/09-30-2026.481.780.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── ID ──
  {
    state: 'ID',
    profession: 'COUNSELING',
    licensePath: 'Registered Intern / LPC → LCPC',
    board: 'Idaho Licensing Board of Professional Counselors and Marriage and Family Therapists',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "Idaho rules set how much supervision you need but don't say whether it must be in person, so check with the board before counting video hours.",
    conditions: [
      'LPC: 1 hour individual supervision per 20 direct client contact hours',
      'LCPC: 1 hour supervision per 30 hours; at least half individual',
      'Supervisor must be Board-approved; 1,000 LCPC hours supervised by an LCPC',
    ],
    citation: 'IDAPA 24.15.01.100.01.c, .100.02.a; IDAPA 24.15.01.200',
    sourceUrl: 'https://www.law.cornell.edu/regulations/idaho/IDAPA-24.15.01.100',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'ID',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Idaho Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your required face-to-face supervision hours can happen in person or over live video, with no cap on video hours.',
    conditions: [
      'At least 100 face-to-face supervision hours; group max 50',
      '3,000 supervised hours over 2–5 years',
      'At least 50% of supervision from an LCSW',
    ],
    citation: 'IDAPA 24.14.01.100.03',
    sourceUrl: 'https://www.law.cornell.edu/regulations/idaho/IDAPA-24.14.01.100',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ID',
    profession: 'MFT',
    licensePath: 'Registered Intern / Associate MFT → LMFT',
    board: 'Idaho Licensing Board of Professional Counselors and Marriage and Family Therapists',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "Idaho rules require 200 supervision hours but don't say whether they must be in person, so check with the board before counting video hours.",
    conditions: [
      '200 supervision hours, at least 100 individual',
      '100 hours supervised by a licensed MFT',
      '2,000 direct client contact hours over at least 2 years',
    ],
    citation: 'IDAPA 24.15.01.100.04.c',
    sourceUrl: 'https://www.law.cornell.edu/regulations/idaho/IDAPA-24.15.01.100',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'ID',
    profession: 'PSYCHOLOGY',
    licensePath: 'Supervised Postdoctoral Experience → Licensed Psychologist',
    board: 'Idaho State Board of Psychologist Examiners',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "Idaho requires weekly face-to-face individual supervision but doesn't say whether video counts as face-to-face, so check with the board before counting video hours.",
    conditions: [
      '1 hour face-to-face individual supervision per 40 hours of experience',
      'Two years of supervised experience; second year must be postdoctoral',
      '1,000+ hours per year over 12–36 months',
    ],
    citation: 'IDAPA 24.12.01.200.01.c; Idaho Code §54-2307',
    sourceUrl: 'https://www.law.cornell.edu/regulations/idaho/IDAPA-24.12.01.200',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'ID',
    profession: 'NP',
    licensePath: 'APRN (Certified Nurse Practitioner), independent practice',
    board: 'Idaho Board of Nursing (Division of Occupational and Professional Licenses)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Idaho don't need a collaborating physician; you can practice and prescribe independently from day one, with no transition-to-practice hours.",
    conditions: [
      'No physician agreement or transition-to-practice hours required',
      'Must consult, collaborate and refer when beyond your competence',
      'Practice limited to education and national certification role/population',
    ],
    citation: 'Idaho Code § 54-1402(1); IDAPA 24.34.01.200.04.a-c',
    sourceUrl:
      'https://proddfmmainsa.blob.core.windows.net/dfm-admin-website/rules/current/24/243401.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ID',
    profession: 'PA',
    licensePath: 'PA with written collaborative practice agreement (or facility bylaws)',
    board: 'Idaho State Board of Medicine (Division of Occupational and Professional Licenses)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote. Idaho lets your practice or facility decide how collaboration works and requires no on-site presence.',
    conditions: [
      'Written collaborative agreement with at least one Idaho-licensed physician',
      'Agreement lists parties, your scope, and any monitoring parameters',
      '2 years licensed before independently owning a practice',
    ],
    citation: 'Idaho Code § 54-1807A(2)-(3); IDAPA 24.33.02.200.01',
    sourceUrl:
      'https://codes.findlaw.com/id/title-54-professions-vocations-and-businesses/id-st-sect-54-1807a.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── IN ──
  {
    state: 'IN',
    profession: 'COUNSELING',
    licensePath: 'LMHCA → LMHC',
    board: 'Indiana Behavioral Health and Human Services Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can complete all of your supervised hours by live, HIPAA-compliant video or in person; phone, email and text do not count.',
    conditions: [
      'Video must be synchronous audio-visual and HIPAA-compliant',
      'Phone, email and text do not count as supervision',
      'Supervisor must be an LMHC or board-approved equivalent',
    ],
    citation: 'IC 25-23.6-8.5-4(a), (g)',
    sourceUrl:
      'https://codes.findlaw.com/in/title-25-professions-and-occupations/in-code-sect-25-23-6-8-5-4/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IN',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSW → LCSW',
    board: 'Indiana Behavioral Health and Human Services Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can complete all of your supervised clinical hours by live, HIPAA-compliant video or in person; phone, email and text do not count.',
    conditions: [
      'Video must be synchronous audio-visual and HIPAA-compliant',
      'Phone, email and text do not count as supervision',
      'Two years of post-MSW experience under a qualified supervisor',
    ],
    citation: 'IC 25-23.6-5-3.5(a), (h)',
    sourceUrl:
      'https://codes.findlaw.com/in/title-25-professions-and-occupations/in-code-sect-25-23-6-5-3-5/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IN',
    profession: 'MFT',
    licensePath: 'LMFTA → LMFT',
    board: 'Indiana Behavioral Health and Human Services Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can complete all 200 of your supervision hours by live, HIPAA-compliant video or in person; phone, email and text do not count.',
    conditions: [
      'Video must be synchronous audio-visual and HIPAA-compliant',
      '200 supervision hours, including 100 individual',
      'Supervisor must be an LMFT with 5+ years or approved equivalent',
    ],
    citation: 'IC 25-23.6-8-2.7(a), (h)',
    sourceUrl:
      'https://codes.findlaw.com/in/title-25-professions-and-occupations/in-code-sect-25-23-6-8-2-7/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'IN',
    profession: 'PSYCHOLOGY',
    licensePath: 'Licensed Psychologist → HSPP endorsement',
    board: 'Indiana State Psychology Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'The required weekly hour of individual supervision must be face-to-face and on site.',
    summary:
      'At least one hour a week of individual supervision must be face-to-face and on site, so video cannot replace it.',
    conditions: [
      'At least 1 hour weekly of individual on-site supervision',
      "Done in the supervisor's office or a setting they oversee",
      'Finish within a consecutive 60-month period',
    ],
    citation: '868 IAC 1.1-13-3.1(d)(3)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/indiana/868-IAC-1.1-13-3.1',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'IN',
    profession: 'NP',
    licensePath: 'APRN (NP) with written practice agreement with a licensed practitioner',
    board: 'Indiana State Board of Nursing (with Medical Licensing Board of Indiana)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      "Practice agreement must state how you and the practitioner maintain 'geographic proximity'; no mileage cap is set.",
    summary:
      "Your collaborating physician can be remote, but your practice agreement must explain how you'll maintain 'geographic proximity', so a far-away physician is risky.",
    conditions: [
      'Written practice agreement required; Indiana has no full-practice-authority pathway',
      'Send physician a 5% random chart and prescription sample within 7 days',
      'Report agreement changes or termination to the board immediately',
    ],
    citation: 'IC 25-23-1-19.4(c); 848 IAC 5-1-1(a)(7)(D), (F), (c)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/indiana/848-IAC-5-1-1',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'IN',
    profession: 'PA',
    licensePath: 'PA with collaborative agreement with a collaborating physician',
    board: 'Medical Licensing Board of Indiana (Physician Assistant Committee)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Off-site physician must be immediately reachable electronically and able to see the patient within a medically appropriate time frame if consultation is requested.',
    summary:
      "Your collaborating physician can be off site if they're immediately reachable by phone or video and can see your patients within a medically appropriate time frame.",
    conditions: [
      'A physician may collaborate with no more than 4 PAs at once',
      'Physician reviews patient encounters within 10 business days',
      'First year of prescribing: physician reviews at least 10% of those charts',
    ],
    citation: 'IC 25-27.5-2-4.9; IC 25-27.5-6-1; IC 25-27.5-6-2; IC 25-27.5-5-2',
    sourceUrl: 'https://iga.in.gov/laws/2026/ic/titles/25',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── KS ──
  {
    state: 'KS',
    profession: 'COUNSELING',
    licensePath: 'LPC → LCPC',
    board: 'Kansas Behavioral Sciences Regulatory Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over secure live video, with no cap on virtual hours.',
    conditions: [
      'Video must be synchronous and confidentiality technologically protected',
      '100 supervision hours, at least 50 individual',
      'At least two sessions monthly, one individual',
    ],
    citation: 'K.A.R. 102-3-7a; K.S.A. 65-5804a',
    sourceUrl: 'https://www.law.cornell.edu/regulations/kansas/K-A-R-102-3-7a',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KS',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LSCSW',
    board: 'Kansas Behavioral Sciences Regulatory Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over secure live video, with no cap on virtual hours.',
    conditions: [
      'Video must be synchronous and confidentiality technologically protected',
      '100 clinical supervision hours, at least 50 individual',
      'At least two sessions monthly, one individual',
    ],
    citation: 'K.A.R. 102-2-12; K.A.R. 102-2-8; K.S.A. 65-6306',
    sourceUrl: 'https://www.law.cornell.edu/regulations/kansas/K-A-R-102-2-12',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KS',
    profession: 'MFT',
    licensePath: 'LMFT → LCMFT',
    board: 'Kansas Behavioral Sciences Regulatory Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over secure live video, with no cap on virtual hours.',
    conditions: [
      'Video must be synchronous and confidentiality technologically protected',
      '100 supervision hours, at least 50 individual',
      'At least one hour twice monthly, one individual',
    ],
    citation: 'K.A.R. 102-5-7a',
    sourceUrl: 'https://www.law.cornell.edu/regulations/kansas/K-A-R-102-5-7a',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KS',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral supervisee → Licensed Psychologist',
    board: 'Kansas Behavioral Sciences Regulatory Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your individual supervision can be in person or by secure televideo, with no cap on virtual hours; phone supervision needs board approval.',
    conditions: [
      'Televideo must protect confidentiality technologically',
      'Telephone supervision only with board-approved extenuating circumstances',
      'Method must allow discussion, observation, and record review',
    ],
    citation: 'K.A.R. 102-1-5a; K.S.A. 74-5310',
    sourceUrl: 'https://www.law.cornell.edu/regulations/kansas/K-A-R-102-1-5a',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KS',
    profession: 'NP',
    licensePath: 'APRN (NP), independent practice',
    board: 'Kansas State Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a collaborating physician in Kansas; since July 2022, APRNs practice and prescribe independently with no transition-to-practice hours.",
    conditions: [
      'Must carry malpractice insurance to provide clinical services',
      'Prescribing limited to your role and population focus',
      'Controlled substances follow the Uniform Controlled Substances Act',
    ],
    citation: 'K.S.A. 65-1130(d) (as amended by L. 2022, ch. 65, § 1)',
    sourceUrl: 'https://ksrevisor.gov/statutes/chapters/ch65/065_011_0030.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KS',
    profession: 'PA',
    licensePath: 'PA with supervising physician (active practice request)',
    board: 'Kansas State Board of Healing Arts',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can be remote, but must be reachable by phone or electronically whenever you see patients.',
    conditions: [
      'First 30 days: physician authenticates all charts within 7 days',
      'Remote practice site requires 80 hours of direct supervision first',
      'From Jan 1, 2027 (HB 2702): collaboration, not supervision, after 4,000 hours',
    ],
    citation: 'K.S.A. 65-28a02; K.A.R. 100-28a-10, 100-28a-14; 2026 HB 2702 (eff. Jan 1, 2027)',
    sourceUrl: 'https://ksrevisor.gov/statutes/chapters/ch65/065_028a_0002.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── KY ──
  {
    state: 'KY',
    profession: 'COUNSELING',
    licensePath: 'LPCA → LPCC',
    board: 'Kentucky Board of Licensed Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live, two-way video, and video sessions count toward your 100 required face-to-face supervision hours.',
    conditions: [
      '100 hours individual face-to-face supervision within 4,000 total hours',
      'Video must be live, simultaneous audio and video',
      'Video platform must meet confidentiality requirements',
    ],
    citation: 'KRS 335.525(1)(e); 201 KAR 36:005 §1(12); 201 KAR 36:060 §3(1)(g)2',
    sourceUrl: 'https://apps.legislature.ky.gov/law/kar/titles/201/036/005/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KY',
    profession: 'SOCIAL_WORK',
    licensePath: 'CSW → LCSW',
    board: 'Kentucky Board of Social Work',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live video where you and your supervisor can see each other, with no cap on virtual hours.',
    conditions: [
      'Supervisor and supervisee must see each other in real time',
      'Platform must meet telehealth confidentiality laws',
      '150 hours total, at least 100 individual',
    ],
    citation: '201 KAR 23:070 §1(3), §8(2)(b)-(c)',
    sourceUrl: 'https://apps.legislature.ky.gov/law/kar/titles/201/023/070/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KY',
    profession: 'MFT',
    licensePath: 'MFTA → LMFT',
    board: 'Kentucky Board of Licensure of Marriage and Family Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Supervision can be in person or by live video, with no cap, as long as you and your supervisor have completed the board's telehealth training.",
    conditions: [
      'Both must complete 15-hour board-approved telehealth training',
      'Video must be live, not recorded',
      '200 supervision hours; at least 100 individual',
    ],
    citation: '201 KAR 32:035 §3(1)(d); 201 KAR 32:110 §3',
    sourceUrl: 'https://apps.legislature.ky.gov/law/kar/titles/201/032/035/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KY',
    profession: 'PSYCHOLOGY',
    licensePath: 'Doctoral candidate (temporary license) → Licensed Psychologist',
    board: 'Kentucky Board of Examiners of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your weekly individual supervision can be in person or by two-way interactive video, with no cap on video hours.',
    conditions: [
      'Weekly individual supervision required',
      'Video must be two-way and interactive',
      'Internship needs 2 weekly hours face-to-face individual supervision',
    ],
    citation: '201 KAR 26:171 §2; 201 KAR 26:190 §1, §2(7), §3(3)',
    sourceUrl: 'https://apps.legislature.ky.gov/law/kar/titles/201/026/171/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KY',
    profession: 'NP',
    licensePath: 'APRN (CNP) with CAPA-NS / CAPA-CS prescribing agreements',
    board: 'Kentucky Board of Nursing (KBML notified of agreements)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote. Agreements only cover prescribing, and NPs with 4 years of prescribing can drop them.',
    conditions: [
      'CAPA-NS for non-controlled prescribing; exempt after 4 years',
      'CAPA-CS meetings quarterly in year 1, twice yearly years 2-4',
      'Physician needs active KY license and same or similar specialty',
    ],
    citation:
      'KRS 314.042(12), (13), (15), (17) (as amended 2026 Ky. Acts ch. 75, eff. Apr. 10, 2026)',
    sourceUrl: 'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=56824',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'KY',
    profession: 'PA',
    licensePath: 'PA with board-approved supervision agreement',
    board: 'Kentucky Board of Medical Licensure',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervising physician can be remote. Kentucky law says supervision doesn't require the physician to be physically present.",
    conditions: [
      'Max 4 PAs per supervising physician',
      'Signed supervision agreement on file with KBML before practicing',
      '1 year PA experience before controlled-substance prescribing',
    ],
    citation:
      'KRS 311.840(8), 311.854, 311.856, 311.858 (as amended 2026 Ky. Acts ch. 94 / SB 116, eff. July 15, 2026); KRS 311.860 repealed',
    sourceUrl: 'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=57544',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── LA ──
  {
    state: 'LA',
    profession: 'COUNSELING',
    licensePath: 'PLPC → LPC',
    board: 'Louisiana Licensed Professional Counselors Board of Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "All of your required supervision hours can be done over live, HIPAA-compliant video, but phone or email contact doesn't count as supervision.",
    conditions: [
      'Video must be synchronous on a HIPAA-compliant platform',
      'Phone, mail, or email contact cannot count as supervision',
      'At least 50 of the 100 supervision hours must be individual',
    ],
    citation: 'LAC 46:LX §605',
    sourceUrl: 'https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-46-SS-LX-605',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'LA',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Louisiana State Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your BACS supervision can be in person or by secure live video, with no cap on virtual hours, as long as you practice in Louisiana.',
    conditions: [
      'You must be actively practicing social work in Louisiana',
      'Supervisor must be Louisiana-licensed and finish 1.5 hours of telesupervision CE',
      'Supervision contract must state the delivery format',
    ],
    citation: 'LAC 46:XXV §§503, 509',
    sourceUrl: 'https://www.labswe.org/assets/docs/pages/62.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'LA',
    profession: 'MFT',
    licensePath: 'PLMFT → LMFT',
    board:
      'Louisiana Licensed Professional Counselors Board of Examiners (LMFT Advisory Committee)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "All of your face-to-face supervision hours can be done over live, HIPAA-compliant video, but phone, email, and messaging don't count without advisory committee pre-approval.",
    conditions: [
      'Video must be synchronous on a HIPAA-compliant platform',
      'Phone, email, or messaging counts only if the advisory committee pre-approves it',
      'At least 100 of 200 supervision hours must be individual',
    ],
    citation: 'LAC 46:LX §3315',
    sourceUrl: 'https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-46-SS-LX-3315',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'LA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral supervisee → Licensed Psychologist',
    board: 'Louisiana State Board of Examiners of Psychologists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Board pre-approval required; telesupervision capped at 50% of required supervision (26 of the yearly required individual hours for postdocs).',
    summary:
      "With board pre-approval, up to half of your supervision can be by live video or audio, and only when in-person supervision isn't feasible.",
    conditions: [
      'Supervisor must get board pre-approval with a written rationale',
      'Only when in-person supervision is not feasible or circumstances are extenuating',
      'Telesupervision cannot be your only contact with your supervisor',
    ],
    citation: 'LAC 46:LXIII §§1409, 703',
    sourceUrl:
      'https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-46-SS-LXIII-1409',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'LA',
    profession: 'NP',
    licensePath: 'APRN (NP) with collaborative practice agreement',
    board:
      'Louisiana State Board of Nursing; Louisiana State Board of Medical Examiners (collaborating physician rules)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote as long as you can reach them face-to-face, by phone, or by direct telecommunication; every Louisiana NP who diagnoses or prescribes needs one.',
    conditions: [
      'Signed collaborative practice agreement on LSBN form required to diagnose or prescribe',
      'No full practice authority or transition-to-practice hours pathway',
      'Physician must be reachable face-to-face, by phone, or telecommunication',
    ],
    citation:
      'La. Admin. Code tit. 46, Pt. XLVII, §4513.D.1.f.iii (LSBN); tit. 46, Pt. XLV, §7917.A.2 (LSBME); R.S. 37:913',
    sourceUrl:
      'https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-46-SS-XLVII-4513',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'LA',
    profession: 'PA',
    licensePath: 'PA with supervising physician (registered with LSBME)',
    board: 'Louisiana State Board of Medical Examiners',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'If you prescribe and work at a different site, your supervising physician must visit your site at least weekly during office hours.',
    summary:
      'Your supervising physician can be off site if reachable by phone, but if you prescribe at a separate site they must visit it at least weekly.',
    conditions: [
      'Weekly physician visit to your site if you prescribe there',
      'Physician must personally see any patient needing physician follow-up',
      'One primary supervising physician may supervise up to eight PAs',
    ],
    citation:
      'R.S. 37:1360.22(8), 37:1360.23(G), 37:1360.28(A); La. Admin. Code tit. 46, Pt. XLV, §4511.A.5',
    sourceUrl: 'https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-46-SS-XLV-4511',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── MA ──
  {
    state: 'MA',
    profession: 'COUNSELING',
    licensePath: "Post-master's counselor → LMHC",
    board: 'Board of Registration of Allied Mental Health and Human Services Professions',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can count supervision by live video or phone toward your LMHC with no cap, under a board policy made permanent in 2023.',
    conditions: [
      "130 post-master's supervision hours, at least 75 individual",
      'At least 1 supervision hour per 16 direct client hours',
      'Supervisor must be on staff at, or contracted with, your site',
    ],
    citation:
      '262 CMR 2.07, 2.08; Board Policy on Teletherapy for Applicant Experience and Supervision Hours (made indefinite 5/19/2023); revised 262 CMR 2.00 issued 7/31/2026',
    sourceUrl:
      'https://www.mass.gov/doc/board-of-registration-of-allied-mental-health-and-human-services-professions-meeting-minutes-5-19-2023-pdf/download',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MA',
    profession: 'SOCIAL_WORK',
    licensePath: 'LCSW → LICSW',
    board: 'Board of Registration of Social Workers',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You can count live video supervision toward your LICSW with no cap, but phone supervision won't count and the board recommends an in-person first session.",
    conditions: [
      'Live video only; phone supervision is not accepted',
      'Board recommends the first supervision session be in person',
      '100 hours of individual supervision from an LICSW',
    ],
    citation:
      '258 CMR 9.03(4), 12.02(1); Board Emergency Policy on Teletherapy for Applicant Experience and Supervision Hours (updated 5/25/2021); Practice Advisory on video supervision (updated 5/26/2020)',
    sourceUrl: 'https://www.mass.gov/policy-advisory/board-policies-and-guidelines-social-workers',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MA',
    profession: 'MFT',
    licensePath: "Post-master's MFT trainee → LMFT",
    board: 'Board of Registration of Allied Mental Health and Human Services Professions',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can count supervision by live video or phone toward your LMFT with no cap, under a board policy made permanent in 2023.',
    conditions: [
      "200 post-master's supervision hours, at least 100 individual",
      "Private practice settings don't qualify for post-master's experience",
      "1,000 post-master's face-to-face client hours, 500 with couples/families",
    ],
    citation:
      '262 CMR 3.03; Board Policy on Teletherapy for Applicant Experience and Supervision Hours (made indefinite 5/19/2023); revised 262 CMR 3.00 issued 7/31/2026',
    sourceUrl:
      'https://www.mass.gov/doc/board-of-registration-of-allied-mental-health-and-human-services-professions-meeting-minutes-5-19-2023-pdf/download',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral trainee → Licensed Psychologist (HSP)',
    board: 'Board of Registration of Psychologists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can count supervision by secure live video toward your Massachusetts psychology license, and your supervisor no longer has to be on site, under a 2023 board policy.',
    conditions: [
      'Use a secure, HIPAA-compliant videoconferencing platform',
      'Supervisor must be available and have record access during services',
      'Weekly supervision, 1 hour per 16 hours, half from a licensed psychologist',
    ],
    citation:
      '251 CMR 3.05(2)(b), (c), (f); M.G.L. c. 112, § 118; Board of Psychologists Policy on Supervision and Teletherapy (10/13/2023)',
    sourceUrl:
      'https://www.mass.gov/policy-advisory/board-policies-and-guidelines-for-psychologists',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MA',
    profession: 'NP',
    licensePath: 'CNP; supervised prescribing for first 2 years, then independent',
    board: 'Massachusetts Board of Registration in Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your prescribing supervisor, a physician or experienced APRN, has no on-site requirement during your first two years, after which you can prescribe without supervision.',
    conditions: [
      '2 years supervised prescriptive practice, then attest for independent prescribing',
      'Signed prescribing guidelines with supervisor, kept on file at workplace',
      'Supervisor may be a qualifying physician or experienced APRN',
    ],
    citation: 'M.G.L. c. 112, §§ 80B, 80E; 244 CMR 4.07(1)-(2)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/massachusetts/244-CMR-4-07',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MA',
    profession: 'PA',
    licensePath: 'PA with supervising physician and written prescribing guidelines',
    board:
      'Massachusetts Board of Registration of Physician Assistants; Board of Registration in Medicine',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervising physician doesn't have to be on site but must review your diagnostic and treatment information on an agreed, timely schedule.",
    conditions: [
      'Written prescribing guidelines with supervisor, signed and reviewed every year',
      'Supervisor reviews Schedule II prescriptions within 96 hours',
      'Backup physician named when supervisor is unavailable',
    ],
    citation: 'M.G.L. c. 112, § 9E; 263 CMR 5.04(3)(a), (d), (g), 5.06; 243 CMR 2.08',
    sourceUrl: 'https://www.law.cornell.edu/regulations/massachusetts/263-CMR-5-04',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── MD ──
  {
    state: 'MD',
    profession: 'COUNSELING',
    licensePath: 'LGPC → LCPC',
    board: 'Maryland Board of Professional Counselors and Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your required face-to-face supervision can happen in person or by live two-way video with no cap on video hours, but phone calls don't count.",
    conditions: [
      'Video must be synchronous, with audio and picture',
      'Telephone, chat, or email supervision does not count',
      "Master's path: at least 50 of 100 hours individual",
    ],
    citation: 'COMAR 10.58.12.02B(7), 10.58.12.05A(2)(g)',
    sourceUrl: 'https://regs.maryland.gov/us/md/exec/comar/10.58.12.02',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MD',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW-C',
    board: 'Maryland Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your face-to-face supervision can happen in person or over secure video with no cap on video hours, but phone supervision doesn't count.",
    conditions: [
      'Video must be secure and visual; telephone does not count',
      'At least 3 hours monthly or 1 hour per 40 worked',
      'Group supervision is capped at half of required hours',
    ],
    citation: 'COMAR 10.42.08.02B(3), 10.42.08.08A(2), 10.42.08.09B',
    sourceUrl: 'https://regs.maryland.gov/us/md/exec/comar/10.42.08.02',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MD',
    profession: 'MFT',
    licensePath: 'LGMFT → LCMFT',
    board: 'Maryland Board of Professional Counselors and Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your required face-to-face supervision can happen in person or by live two-way video with no cap on video hours, but phone calls don't count.",
    conditions: [
      'Video must be synchronous, with audio and picture',
      'Telephone or text-based supervision does not count',
      'At least 50 of 100 supervision hours must be individual',
    ],
    citation: 'COMAR 10.58.08.02B(7), 10.58.08.05A(3)(f)',
    sourceUrl: 'https://regs.maryland.gov/us/md/exec/comar/10.58.08.02',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MD',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychology Associate / Postdoc → Licensed Psychologist',
    board: 'Maryland State Board of Examiners of Psychologists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video counts for registered psychology associates, but an off-site supervisor must visit quarterly; other postdocs need on-site supervision unless the Board grants a waiver.',
    summary:
      "If you're a registered psychology associate, video supervision counts but an off-site supervisor must visit quarterly; exempt-setting postdocs need on-site supervision unless the Board waives it.",
    conditions: [
      'Off-site supervisor must make quarterly site visits',
      'Exempt-setting postdocs need on-site face-to-face supervision',
      'Waiver for remote supervision must be requested before starting',
    ],
    citation: 'COMAR 10.36.07.03A(8)-(9); 10.36.01.04-3G-J; 10.36.01.04-4',
    sourceUrl: 'https://regs.maryland.gov/us/md/exec/comar/10.36.07.03',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MD',
    profession: 'NP',
    licensePath: 'Certified Registered Nurse Practitioner (full practice authority)',
    board: 'Maryland Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a collaborating physician in Maryland; if you've never been certified anywhere, you name an 18-month mentor who advises as needed.",
    conditions: [
      'New NPs name a mentor for 18 months from application',
      "Mentor: Maryland NP or physician with 3+ years' experience",
      'Mentor gives advice and consultation as needed; no supervision required',
    ],
    citation: 'Md. Code, Health Occ. § 8-302.1(d)(1); COMAR 10.27.07.01',
    sourceUrl:
      'https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gho&section=8-302.1&enactments=false',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MD',
    profession: 'PA',
    licensePath: 'PA with collaboration agreement (patient care team physician)',
    board: 'Maryland Board of Physicians (Physician Assistant Advisory Committee)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your patient care team physician doesn't need to be on site in Maryland, as long as they're reachable electronically and regularly practice in the state.",
    conditions: [
      'Collaboration agreement must be noticed to the Board before practicing',
      'Max 8 PAs per physician (except hospitals, corrections, public health)',
      'Physician must regularly practice in Maryland',
    ],
    citation: 'Md. Code, Health Occ. §§ 15-101(d)(2), 15-101(p), 15-302; COMAR 10.32.03.02',
    sourceUrl:
      'https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gho&section=15-101&enactments=false',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── ME ──
  {
    state: 'ME',
    profession: 'COUNSELING',
    licensePath: 'LCPC-Conditional → LCPC',
    board: 'Maine Board of Counseling Professionals Licensure',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Supervisor may join by live video or audio for up to 25 individual supervision hours (38 on the 4,000-hour track); rules silent on group supervision.',
    summary:
      'Your supervisor can join by video or phone for up to 25 of your individual supervision hours, so plan the remaining individual hours in person.',
    conditions: [
      '100 supervision hours over 3,000 experience hours, at least 50 individual',
      'Rules are silent on remote group supervision; confirm with the board',
      'Supervisor must be board-approved before you start',
    ],
    citation: '02-514 C.M.R. ch. 3, §4(1)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/maine/02-514-C-M-R-ch-3-SS-4',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ME',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW-CC (Conditional Clinical) → LCSW',
    board: 'Maine State Board of Social Worker Licensure',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your clinical consultation hours can be in person, by live video, or any mix with no video cap, but phone-only sessions do not count.',
    conditions: [
      'Audio-only supervision is not permitted',
      '96 hours: 72 individual, 24 in groups of up to 8',
      'Clinical setting required; private or self-employed practice not credited',
    ],
    citation: '02-416 C.M.R. ch. 13, §5(1)(D)(2)-(3)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/maine/02-416-C-M-R-ch-13-SS-5',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ME',
    profession: 'MFT',
    licensePath: 'LMFT-Conditional → LMFT',
    board: 'Maine Board of Counseling Professionals Licensure',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Supervisor may join by live video or audio for up to 50 individual supervision hours (75 on the 4,000-hour track); rules silent on group supervision.',
    summary:
      'Your supervisor can join by video or phone for up to 50 of your individual supervision hours, so plan the remaining individual hours in person.',
    conditions: [
      '200 supervision hours over 3,000 experience hours, at least 100 individual',
      'Rules are silent on remote group supervision; confirm with the board',
      'Supervisor must be board-approved before you start',
    ],
    citation: '02-514 C.M.R. ch. 4, §4(1)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/maine/02-514-C-M-R-ch-4-SS-4',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ME',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral / Conditional Psychologist → Psychologist',
    board: 'Maine State Board of Examiners of Psychologists',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "Maine requires weekly one-to-one 'face-to-face' supervision but never says whether video counts, so get the board's advance approval before relying on video hours.",
    conditions: [
      '1,500 postdoctoral hours over 48 to 104 weeks',
      'Weekly one hour individual supervision plus one hour learning activities',
      'Other supervision arrangements need advance board approval',
    ],
    citation: '02-415 C.M.R. ch. 3, §6(4); ch. 4, §2(2); 32 M.R.S. §3831',
    sourceUrl: 'https://www.law.cornell.edu/regulations/maine/02-415-C-M-R-ch-3-SS-6',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'ME',
    profession: 'NP',
    licensePath: 'APRN (CNP); 24 months supervised practice, then independent',
    board: 'Maine State Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'For your first 24 months you need a supervising physician or NP, but nothing requires them on site, and afterward you need no physician at all.',
    conditions: [
      '24 months supervised by physician, supervising NP, or physician-medical-director employer',
      'Register supervising relationship with Board; submit completion letter',
      'Proposed rule 2026-P157 would substitute NP mentorship; not yet adopted',
    ],
    citation:
      '32 M.R.S. §2102(2-A), as amended by P.L. 2025, c. 540 (LD 961); 32 M.R.S. §2205-B(4-A); 02-380 C.M.R. Ch. 8, §2(2)',
    sourceUrl: 'https://legislature.maine.gov/legis/bills/getPDF.asp?paper=HP0620&item=3&snum=132',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'ME',
    profession: 'PA',
    licensePath: 'Physician Associate (PA) with collaborative agreement under 4,000 hours',
    board: 'Maine Board of Licensure in Medicine; Maine Board of Osteopathic Licensure',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can work with you entirely remotely, and after 4,000 documented hours you no longer need a collaborative agreement.',
    conditions: [
      'Under 4,000 hours: Board-approved collaborative agreement (or facility credentialing system)',
      'Over 4,000 hours: practice agreement only if principal provider without physician partner',
      'A physician must be accessible at all times for consultation',
    ],
    citation:
      '32 M.R.S. §3270-G(4)-(6) (MD board); 32 M.R.S. §2594-F(4)-(6) (osteopathic board); P.L. 2019, c. 627; P.L. 2025, c. 316',
    sourceUrl: 'https://legislature.maine.gov/statutes/32/title32sec3270-G.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── MI ──
  {
    state: 'MI',
    profession: 'COUNSELING',
    licensePath: 'LLPC → LPC',
    board: 'Michigan Board of Counseling',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by live two-way video, with no cap on video hours.',
    conditions: [
      '100 hours of regularly scheduled supervision (50 with a doctorate)',
      "3,000 experience hours over at least 2 years (master's)",
      'Supervisor must be an LPC trained in counseling supervision',
    ],
    citation: 'Mich Admin Code R 338.1774(1)(c)(i)-(ii); R 338.1781',
    sourceUrl: 'https://www.law.cornell.edu/regulations/michigan/Mich-Admin-Code-R-338-1774',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MI',
    profession: 'SOCIAL_WORK',
    licensePath: 'LLMSW → LMSW (Clinical)',
    board: 'Michigan Board of Social Work',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your individual supervision can be in person or by live, simultaneous video, with no cap on virtual hours.',
    conditions: [
      'At least 4 hours of supervisory review per month',
      'At least 2 of those hours individual with your supervisor',
      'Supervisor must be a Michigan LMSW with clinical designation',
    ],
    citation: 'Mich Admin Code R 338.2949(3)(b)-(c); R 338.2953(b)(ii)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/michigan/Mich-Admin-Code-R-338-2949',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MI',
    profession: 'MFT',
    licensePath: 'Limited LMFT → LMFT',
    board: 'Michigan Board of Marriage and Family Therapy',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Michigan requires face-to-face MFT supervision but does not say whether live video counts. Confirm with the board before relying on video hours.',
    conditions: [
      '200 supervision hours across 1,000 direct client contact hours',
      'At least 100 hours individual, with at most 1 other supervisee',
      'Group supervision capped at 6 supervisees per supervisor',
    ],
    citation: 'MCL 333.16909(1)(c)(iii); Mich Admin Code R 338.7205(d)',
    sourceUrl: 'https://legislature.mi.gov/Laws/MCL?objectName=mcl-333-16909',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MI',
    profession: 'PSYCHOLOGY',
    licensePath: 'Educational Limited License (postdoc) → Licensed Psychologist',
    board: 'Michigan Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your postdoctoral supervision can be in person or by live two-way video, with no cap on virtual hours.',
    conditions: [
      '2,000 postdoctoral hours within 2 consecutive years',
      'Individual supervision weekly, at least 4 hours a month',
      'Experience must be in an organized healthcare setting',
    ],
    citation: 'Mich Admin Code R 338.2553(3)(b)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/michigan/Mich-Admin-Code-R-338-2553',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MI',
    profession: 'NP',
    licensePath:
      'RN with NP specialty certification (APRN); physician delegation only for controlled substances',
    board: 'Michigan Board of Nursing; Michigan Board of Medicine (delegation rule)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You only need a delegating physician to prescribe controlled substances, and they can be remote if you can reach them by phone or telecommunication.',
    conditions: [
      'Schedule 2-5 prescribing needs a written physician delegation',
      'Delegating physician must review and update the authorization every year',
      'Both names and DEA numbers go on controlled-substance prescriptions',
    ],
    citation: 'MCL 333.17211a; MCL 333.16215; MCL 333.16109(2); Mich. Admin. Code R 338.2411',
    sourceUrl: 'https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-333-16109',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MI',
    profession: 'PA',
    licensePath: 'PA with practice agreement with a participating physician',
    board:
      "Michigan Task Force on Physician's Assistants; Michigan Boards of Medicine / Osteopathic Medicine and Surgery",
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your participating physician can be remote, since Michigan only requires a practice agreement setting how you communicate and naming a backup physician.',
    conditions: [
      'Signed practice agreement covering communication, availability and decision making',
      'Protocol naming an alternative physician when participating physician is unavailable',
      '30-day written notice to terminate the agreement',
    ],
    citation: 'MCL 333.17047; MCL 333.17049; MCL 333.17076; Mich. Admin. Code R 338.2409',
    sourceUrl: 'https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-333-17047',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── MN ──
  {
    state: 'MN',
    profession: 'COUNSELING',
    licensePath: 'LPC / postdegree applicant → LPCC',
    board: 'Minnesota Board of Behavioral Health and Therapy',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'All of your supervision can be by live two-way video, and up to 25% may instead be by phone.',
    conditions: [
      'Video must be real-time, two-way audio and visual',
      'At least 50% of supervision hours must be individual',
      'Up to 25% of hours may be by telephone',
    ],
    citation: 'Minn. Stat. §148B.5301, subd. 2(c); Minn. R. 2150.5010, subp. 4, item C',
    sourceUrl: 'https://www.revisor.mn.gov/statutes/cite/148B.5301',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MN',
    profession: 'SOCIAL_WORK',
    licensePath: 'LGSW → LICSW',
    board: 'Minnesota Board of Social Work',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'All of your required supervision hours can be by live video, and the board must accept fully virtual supervision.',
    conditions: [
      'Video must keep eye-to-eye visual contact',
      '100 of 200 hours must be one-on-one',
      'Group supervision max six supervisees; never by email',
    ],
    citation: 'Minn. Stat. §148E.106, subd. 3',
    sourceUrl: 'https://www.revisor.mn.gov/statutes/cite/148E.106',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MN',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board: 'Minnesota Board of Marriage and Family Therapy',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'All of your postgraduate supervision hours can be by live two-way video, with no cap on virtual hours.',
    conditions: [
      'Video must be real-time, two-way audio and visual',
      'Supervisor must meet board supervisor requirements (Minn. R. 5300.0170)',
    ],
    citation: 'Minn. Stat. §148B.33, subd. 1a',
    sourceUrl: 'https://www.revisor.mn.gov/statutes/cite/148B.33',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MN',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral applicant → Licensed Psychologist (LP)',
    board: 'Minnesota Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Minnesota law lets your supervision include live video telesupervision with no cap, but an older board rule still says in-person, so confirm with the board.',
    conditions: [
      'Two hours per week of regularly scheduled supervision',
      'One weekly hour individually with your primary supervisor',
      'Telesupervision must be synchronous audio and video',
    ],
    citation: 'Minn. Stat. §148.925, subds. 1 & 5; §148.89, subd. 9; Minn. R. 7200.2000, subp. 2',
    sourceUrl: 'https://www.revisor.mn.gov/statutes/cite/148.925',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MN',
    profession: 'NP',
    licensePath: 'APRN (CNP); collaborative agreement for first 2,080 hours, then independent',
    board: 'Minnesota Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Minnesota law doesn't require your collaborator on-site during your first 2,080 hours, though specialty NPs must work alongside physicians; afterward you practice independently.",
    conditions: [
      '2,080 postgraduate hours under a collaborative agreement before full independence',
      'Specialty (non-primary, non-mental-health) NPs: first 2,080 hours in shared APRN-physician setting',
      'Collaborator: physician with similar-patient experience, or APRN with 3+ years',
    ],
    citation:
      'Minn. Stat. § 148.211, subds. 1c and 1d (as amended by Laws 2026, ch. 115, art. 11, §§ 1-2)',
    sourceUrl: 'https://www.revisor.mn.gov/laws/2026/0/Session+Law/Chapter/115/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MN',
    profession: 'PA',
    licensePath:
      'PA with collaborative agreement (first 2,080 hours), then practice-level practice agreement',
    board: 'Minnesota Board of Medical Practice',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'During your first 2,080 hours your collaborating physician can be remote if easily reachable by phone or telecom; afterward a same-facility physician reviews your practice agreement yearly.',
    conditions: [
      '2,080 hours under collaborative agreement in hospital or integrated clinical setting',
      'Practice agreement reviewed annually by a physician at same facility',
      'Spinal injections for pain require referral and physician collaboration',
    ],
    citation: 'Minn. Stat. § 147A.02(c); § 147A.09, subds. 1, 3, 4',
    sourceUrl: 'https://www.revisor.mn.gov/statutes/cite/147A.02',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── MO ──
  {
    state: 'MO',
    profession: 'COUNSELING',
    licensePath: 'PLPC → LPC',
    board: 'Missouri Committee for Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your weekly supervision can be in person or by live two-way video with no cap on video hours, but phone-only or text supervision does not count.',
    conditions: [
      'At least 1 hour of supervision weekly with your registered supervisor',
      'At least 2 weeks each month must be individual supervision',
      'Video must be live, with both audio and visual interaction',
    ],
    citation: '20 CSR 2095-2.020(7)(C)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/missouri/20-CSR-2095-2-020',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MO',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Missouri State Committee for Social Workers',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over confidential live video, with no cap on video hours.',
    conditions: [
      '2 individual hours every 2 weeks, or 4 hours per 4 weeks',
      'Up to 50% of monthly supervision may be group',
      'Video must be live, two-way and confidential',
    ],
    citation: '20 CSR 2263-2.030(3)(A)4.; 20 CSR 2263-2.031',
    sourceUrl: 'https://www.law.cornell.edu/regulations/missouri/20-CSR-2263-2-030',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MO',
    profession: 'MFT',
    licensePath: 'PLMFT / S-MFT → LMFT',
    board: 'Missouri State Committee of Marital and Family Therapists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video can replace face-to-face supervision only after you submit a request for electronic supervision.',
    summary:
      'Video supervision can count toward your face-to-face hours, but you must request it first and use a secure, private, live audio-video system.',
    conditions: [
      'Submit a request before using video supervision',
      'Use a secure, real-time system with audio and video',
      'At least 100 of your 200 supervision hours must be individual',
    ],
    citation: '20 CSR 2233-2.020(8)(B)4.',
    sourceUrl: 'https://www.law.cornell.edu/regulations/missouri/20-CSR-2233-2-020',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MO',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral trainee / Provisional Licensed Psychologist → Licensed Psychologist',
    board: 'Missouri State Committee of Psychologists',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Missouri requires weekly face-to-face individual supervision but never says whether video counts, so confirm with the board before relying on video hours.',
    conditions: [
      'At least 1 hour per week of individual face-to-face supervision',
      'Group supervision does not count',
      'Some training programs require an onsite supervisor 15 hours weekly',
    ],
    citation: '20 CSR 2235-2.040(1)(D)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/missouri/20-CSR-2235-2-040',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MO',
    profession: 'NP',
    licensePath: 'APRN (NP) with written collaborative practice arrangement',
    board:
      'Missouri State Board of Nursing and State Board of Registration for the Healing Arts (joint rules)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'You must first practice one month with the physician continuously on site. After that, the proximity rule is waived only if the agreement sets out telehealth use.',
    summary:
      'Your collaborating physician can be remote if your agreement covers telehealth, but you must first practice one month with them on site.',
    conditions: [
      'First month: physician continuously present before you practice apart',
      'Physician present every 2 weeks; telehealth OK under RSMo 335.175',
      'Physician reviews 10% of charts every 14 days (20% controlled substances)',
    ],
    citation:
      'RSMo 334.104.3(5)(b), 334.104.3(9)-(11), 334.104.9; RSMo 335.175; 20 CSR 2150-5.100(3)(A), (3)(E)-(F)',
    sourceUrl:
      'https://codes.findlaw.com/mo/title-xxii-occupations-and-professions/mo-rev-st-334-104/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MO',
    profession: 'PA',
    licensePath: 'PA with written collaborative practice arrangement',
    board:
      'Missouri State Board of Registration for the Healing Arts (Advisory Commission for Physician Assistants)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'You must first practice one month with the physician continuously on site. After that, the physician must be present every two weeks, by telehealth only if you deliver care by telehealth.',
    summary:
      "Your collaborating physician can be remote after a first month practicing together on site, but must 'be present' every two weeks.",
    conditions: [
      'First month: physician continuously present before you practice apart',
      'Physician present every 2 weeks (telehealth OK if you use telehealth)',
      'Physician reviews 10% of charts every 14 days (20% controlled substances)',
    ],
    citation:
      'RSMo 334.735.5, 334.735.9(5), 334.735.9(10)-(11), 334.735.13; 20 CSR 2150-7.135(6)-(7)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/missouri/20-CSR-2150-7-135',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── MS ──
  {
    state: 'MS',
    profession: 'COUNSELING',
    licensePath: 'P-LPC → LPC',
    board: 'Mississippi State Board of Examiners for Licensed Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervision can be in person or by secure live video with no cap, as long as your LPC-S holds the Board's Distance Professional Services designation.",
    conditions: [
      "LPC-S must hold the Board's Distance Professional Services designation (Rule 7.5)",
      'Secure synchronous video only; phone, email or chat only for emergencies',
      'Supervision contract must explain distance supervision use, limits and backup plan',
    ],
    citation: '30 Miss. Admin. Code Pt. 2201, R. 4.3(B)(1)(d), 4.3(B)(2), 7.5',
    sourceUrl:
      'https://www.msblpc.org/wp-content/uploads/Part_2201_Rules_and_Regulations_Current.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MS',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Mississippi Board of Examiners for Social Workers and Marriage and Family Therapists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'No more than one-fourth of the required 100 supervision hours (25 hours) may be by live audiovisual means.',
    summary:
      'Up to 25 of your 100 required supervision hours can be by live video; the rest must be face-to-face with your LCSW supervisor.',
    conditions: [
      'Supervisor outside your agency must visit your practice site every six months',
      'Video sessions must be live, interactive and confidentiality-protected (encryption)',
      'Supervision must take place in an agency, institution or group practice',
    ],
    citation: '30 Miss. Admin. Code Pt. 1902, R. 2.3(E)(2)(c)',
    sourceUrl:
      'https://www.swmft.ms.gov/sites/swmft2/files/2022%20Published%20Rules%20and%20Regs.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MS',
    profession: 'MFT',
    licensePath: 'LMFTA → LMFT',
    board: 'Mississippi Board of Examiners for Social Workers and Marriage and Family Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over a secure video platform, with no cap on virtual hours.',
    conditions: [
      'Must use a secure video conferencing platform',
      'Average 1 hour weekly for 24-36 months; 50 of 200 hours individual',
      'Experience must be in an agency, institution or group practice setting',
    ],
    citation: '30 Miss. Admin. Code Pt. 1903, R. 1.2(O), R. 2.2(C)(3)(h)',
    sourceUrl:
      'https://www.swmft.ms.gov/sites/swmft2/files/2022%20Published%20Rules%20and%20Regs.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MS',
    profession: 'PSYCHOLOGY',
    licensePath: 'Doctoral internship → Licensed Psychologist',
    board: 'Mississippi Board of Psychology',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Mississippi needs only an APA/CPA-accredited predoctoral internship, with no postdoc year, and its rules say nothing about video supervision.',
    conditions: [
      'One year full-time or two years half-time predoctoral internship',
      'Internship must be APA/CPA accredited with at least 1,800 hours',
      'Supervisor keeps final responsibility for intern and supervisee work',
    ],
    citation: '30 Miss. Admin. Code Pt. 3201, R. 4.6, 7.2-7.4; Miss. Code Ann. § 73-31-13',
    sourceUrl:
      'https://www.psychologyboard.ms.gov/sites/psyboard/files/2022/Rules%20and%20Regulations%2010.19.2022.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MS',
    profession: 'NP',
    licensePath: 'APRN (CNP) with formal collaborative agreement',
    board: 'Mississippi Board of Nursing; Mississippi State Board of Medical Licensure',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Beyond 75 miles requires a Board-approved protocol unless you and the physician are compatible primary care providers meeting the EMR and 20 hrs/week in-state conditions; hospitals, health departments, FQHCs and volunteer clinics are excluded.',
    summary:
      "Your collaborating physician can be remote but must practice 20+ hours weekly in Mississippi; beyond 75 miles needs a Board-approved protocol unless you're both primary care.",
    conditions: [
      '1,000-2,000 monitored practice hours before practicing at a site',
      'Physician reviews 10% or 20 charts monthly, whichever is less',
      'Quarterly face-to-face QA meeting; video conferencing allowed',
    ],
    citation:
      'Miss. Code Ann. § 73-15-20; 30 Miss. Admin. Code Pt. 2630, R. 1.2-1.8 (BML); 30 Miss. Admin. Code Pt. 2840, R. 1.3-1.4 (BON)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/mississippi/30-Miss-Code-R-SS-2630-1-4',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MS',
    profession: 'PA',
    licensePath: 'PA with supervising physician and protocol',
    board: 'Mississippi State Board of Medical Licensure (Physician Assistant Advisory Committee)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'New-grad and initial-license PAs need on-site supervision for 120 days/960 hours; practice beyond 75 miles needs Board approval unless both are in primary care.',
    summary:
      "Your supervising physician can be remote after any required 960 on-site hours, but practicing beyond 75 miles needs Board approval unless you're both in primary care.",
    conditions: [
      'New grads/initial MS license: 120 days (960 hours) on-site supervision',
      'Physician reviews 10% or 20 charts monthly, whichever is less',
      'Quarterly face-to-face QA meeting; video conferencing allowed',
    ],
    citation: 'Miss. Code Ann. § 73-26-5; 30 Miss. Admin. Code Pt. 2615, R. 1.6',
    sourceUrl: 'https://www.law.cornell.edu/regulations/mississippi/30-Miss-Code-R-SS-2615-1-6',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── MT ──
  {
    state: 'MT',
    profession: 'COUNSELING',
    licensePath: 'LCPC Candidate → LCPC',
    board: 'Montana Board of Behavioral Health',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your required face-to-face supervision can be in person or by live two-way audio-video, with no cap on video hours.',
    conditions: [
      'At least 1 hour face-to-face supervision per 20 counseling hours',
      'Video must be real-time, interactive, with audio and visual',
      'Supervisor must hold an active license where supervision occurs',
    ],
    citation: 'ARM 24.219.301(13); ARM 24.219.604',
    sourceUrl:
      'https://rules.mt.gov/browse/collections/aec52c46-128e-4279-9068-8af5d5432d74/policies/9c2b25c5-cd3d-4aa7-b1b9-0a4cad5fd440',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MT',
    profession: 'SOCIAL_WORK',
    licensePath: 'LCSW Candidate → LCSW',
    board: 'Montana Board of Behavioral Health',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your required face-to-face supervision can be in person or by live two-way audio-video, with no cap on video hours.',
    conditions: [
      '50 individual face-to-face hours with an LCSW supervisor',
      '10 of those hours must include direct observation of service delivery',
      'At least 2 supervision hours per 160 hours of social work',
    ],
    citation: 'ARM 24.219.301(13); ARM 24.219.504',
    sourceUrl:
      'https://rules.mt.gov/browse/collections/aec52c46-128e-4279-9068-8af5d5432d74/policies/9c2b25c5-cd3d-4aa7-b1b9-0a4cad5fd440',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MT',
    profession: 'MFT',
    licensePath: 'LMFT Candidate → LMFT',
    board: 'Montana Board of Behavioral Health',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your required face-to-face supervision can be in person or by live two-way audio-video, with no cap on video hours.',
    conditions: [
      '40 face-to-face supervision hours, at least 38 individual',
      '25 hours using raw clinical data (live feed, video, or audio)',
      '20:1 client contact to supervision ratio',
    ],
    citation: 'ARM 24.219.301(13); ARM 24.219.704',
    sourceUrl:
      'https://rules.mt.gov/browse/collections/aec52c46-128e-4279-9068-8af5d5432d74/policies/9c2b25c5-cd3d-4aa7-b1b9-0a4cad5fd440',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MT',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral Supervisee (Psychological Resident) → Licensed Psychologist',
    board: 'Montana Board of Psychologists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Telehealth supervision must be approved, and another licensed professional must be on-site when the supervisor is not.',
    summary:
      "Your weekly supervision can be in person or by approved telehealth, but another licensed professional must be on-site whenever your supervisor isn't.",
    conditions: [
      'At least one hour of supervision every week',
      'Telehealth supervision must be approved (likely in your board-approved plan)',
      'Second licensed mental health professional on-site when supervisor is absent',
    ],
    citation: 'ARM 24.189.648(3)',
    sourceUrl:
      'https://rules.mt.gov/browse/collections/aec52c46-128e-4279-9068-8af5d5432d74/policies/6e9f931d-936e-4492-9ae7-8961cf185b72',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MT',
    profession: 'NP',
    licensePath: 'APRN (NP) certificate, independent practice',
    board: 'Montana Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a collaborating physician in Montana; once the Board of Nursing grants your APRN certificate, you practice and prescribe independently.",
    conditions: [
      'Board-approved national certification required for APRN certificate',
      'Prescriptive authority requires a separate Board of Nursing application',
      'No transition-to-practice hours required',
    ],
    citation: 'Mont. Code Ann. 37-8-409; 37-8-202(1)(h); ARM 24.159.1461, 24.159.1463',
    sourceUrl:
      'https://mca.legmt.gov/bills/mca/title_0370/chapter_0080/part_0040/section_0090/0370-0080-0040-0090.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'MT',
    profession: 'PA',
    licensePath: 'PA license with collaborative agreement (under 8,000 hours)',
    board: 'Montana Board of Medical Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating provider can work remotely, since Montana requires only consultation and guidance, and you need no collaborator after 8,000 postgraduate hours.',
    conditions: [
      'Collaborative agreement required under 8,000 postgraduate clinical hours',
      'Collaborator may be a physician or PA with 8,000+ hours',
      'Written collaboration policies required; agreement kept at practice site',
    ],
    citation: 'Mont. Code Ann. 37-20-203 (amd. Sec. 5, Ch. 88, L. 2023); ARM 24.156.1622',
    sourceUrl:
      'https://mca.legmt.gov/bills/mca/title_0370/chapter_0200/part_0020/section_0030/0370-0200-0020-0030.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── NC ──
  {
    state: 'NC',
    profession: 'COUNSELING',
    licensePath: 'LCMHCA → LCMHC',
    board: 'North Carolina Board of Licensed Clinical Mental Health Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by live, synchronous video, and the rules set no cap on video hours.',
    conditions: [
      'Video must be synchronous with live verbal and visual interaction',
      '1 hour individual or 2 hours group supervision per 40 practice hours',
      'At least three-quarters of supervision hours must be individual',
    ],
    citation: '21 NCAC 53 .0212; .0210; .0208',
    sourceUrl: 'https://www.law.cornell.edu/regulations/north-carolina/21-N-C-Admin-Code-53-0212',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NC',
    profession: 'SOCIAL_WORK',
    licensePath: 'LCSWA → LCSW',
    board: 'North Carolina Social Work Certification and Licensure Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'No more than 50 of the 100 required supervision hours may be by technology unless the Board preapproves more.',
    summary:
      'You can count up to 50 of your 100 required supervision hours by live video, and your supervisor must get Board preapproval for more.',
    conditions: [
      'Technology hours must be synchronous video and audio for the whole session',
      'Supervision at least every two weeks, 1 hour per 30 practice hours',
      'No more than 25 group supervision hours count',
    ],
    citation: '21 NCAC 63 .0211(a)(3)-(4)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/north-carolina/21-N-C-Admin-Code-63-0211',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NC',
    profession: 'MFT',
    licensePath: 'LMFTA → LMFT',
    board: 'North Carolina Marriage and Family Therapy Licensure Board',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "North Carolina's rule requires face-to-face supervision but never says whether video counts, so confirm with the board before relying on video hours.",
    conditions: [
      '200 supervision hours from an AAMFT Approved Supervisor or equivalent',
      'If you finished 200 hours in your program, 25 more post-degree',
      'LMFTAs need at least one supervision hour every month',
    ],
    citation: '21 NCAC 31 .0502',
    sourceUrl: 'https://www.law.cornell.edu/regulations/north-carolina/21-N-C-Admin-Code-31-0502',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NC',
    profession: 'PSYCHOLOGY',
    licensePath: 'Supervised applicant / LPA → Licensed Psychologist',
    board: 'North Carolina Psychology Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or by real-time video, and the rules set no cap on video hours.',
    conditions: [
      'Video must be real-time with verbal and visual interaction throughout',
      'Applicants need one hour individual supervision weekly while practicing',
      "Psychological associates' monthly supervision hours scale with their practice hours",
    ],
    citation: '21 NCAC 54 .2005; .2007; .2008',
    sourceUrl: 'https://www.law.cornell.edu/regulations/north-carolina/21-N-C-Admin-Code-54-2005',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NC',
    profession: 'NP',
    licensePath: 'NP approval to practice with collaborative practice agreement',
    board: 'North Carolina Board of Nursing and North Carolina Medical Board (Joint Subcommittee)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervising physician can be remote, as long as you're both continuously reachable by phone or telecommunication and hold the required quality-improvement meetings.",
    conditions: [
      'Monthly physician meetings for first 6 months, then every 6 months',
      'Collaborative practice agreement signed, kept at each site, reviewed yearly',
      'Meetings documented, signed, and kept for 5 years',
    ],
    citation: '21 NCAC 36 .0810 / 21 NCAC 32M .0110 (Amended Eff. June 1, 2021); G.S. 90-18.2',
    sourceUrl:
      'http://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2036%20-%20nursing/21%20ncac%2036%20.0810.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NC',
    profession: 'PA',
    licensePath: 'PA license with supervising physician (or registered team-based PA)',
    board: 'North Carolina Medical Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can be remote, and registered team-based PAs with 4,000+ hours (1,000 in their specialty) are exempt from standard supervision rules.',
    conditions: [
      'Monthly meetings first 6 months, then every 6 months',
      'Signed supervisory arrangement statement and prescribing instructions at each site',
      'Team-based: 4,000 hours, 1,000 in specialty, qualifying setting, Board registration',
    ],
    citation:
      '21 NCAC 32S .0213 (Amended Eff. May 1, 2022); 21 NCAC 32S .0227 (Eff. Aug. 1, 2026); G.S. 90-18.1, 90-9.3A',
    sourceUrl:
      'http://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2032%20-%20north%20carolina%20medical%20board/subchapter%20s/21%20ncac%2032s%20.0213.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── ND ──
  {
    state: 'ND',
    profession: 'COUNSELING',
    licensePath: 'LAPC → LPC / LPCC',
    board: 'North Dakota Board of Counselor Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or over secure, HIPAA-compliant video, with no cap on virtual hours.',
    conditions: [
      '100 supervision hours over two years, at least 60 individual',
      'Video must be secure and HIPAA compliant',
      'Supervisor must be a board-certified LPC or LPCC supervisor',
    ],
    citation: 'N.D. Admin. Code §§97-02-01-01(3), 97-02-01-03(3), 97-02-01.1-01(3)(b)',
    sourceUrl: 'https://www.ndlegis.gov/information/acdata/pdf/97-02-01.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ND',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'North Dakota Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your required face-to-face supervision can be in person, by video, or even by phone, with no cap on remote hours.',
    conditions: [
      '150 hours of face-to-face clinical supervision, max 50 group',
      '3,000 hours in four years; first 1,500 under an LCSW',
      'Submit a supervision plan to the board before starting',
    ],
    citation: 'N.D. Admin. Code §§75.5-02-01-03(8), 75.5-02-03-04.1; N.D.C.C. §43-41-04',
    sourceUrl: 'https://www.ndlegis.gov/information/acdata/pdf/75.5-02-01.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ND',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board: 'North Dakota Marriage and Family Therapy Licensure Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Live two-way video supervision counts as in-person supervision, with no limit on video hours.',
    conditions: [
      '200 face-to-face supervision hours, at least 100 individual',
      'At least one hour of supervision every two weeks',
      'Video must be real-time with both audio and visual',
    ],
    citation: 'N.D. Admin. Code §111-02-02-03(5)(f), (i)',
    sourceUrl: 'https://www.ndlegis.gov/information/acdata/pdf/111-02-02.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ND',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychology Resident → Licensed Psychologist',
    board: 'North Dakota State Board of Psychologist Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Weekly postdoctoral supervision can be face-to-face or by distance communication, and state law sets no cap on remote hours.',
    conditions: [
      '100 hours of weekly direct supervision across 1,500 postdoctoral hours',
      'At least 50 hours with the primary supervisor',
      'Primary supervisor licensed at least three years',
    ],
    citation: 'N.D.C.C. §43-32-20.1(3); N.D. Admin. Code §66-02-01-11.1',
    sourceUrl: 'https://www.ndlegis.gov/cencode/t43c32.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ND',
    profession: 'NP',
    licensePath: 'APRN (CNP), full practice authority',
    board: 'North Dakota Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a collaborating physician as a North Dakota NP, and there's no physician agreement or transition-to-practice hours requirement for licensure or prescribing.",
    conditions: [
      'Prescriptive authority requires separate application to the Board of Nursing',
      '30 contact hours of pharmacotherapy within 3 years before applying',
      'Own DEA registration required for controlled substances',
    ],
    citation:
      'NDCC 43-12.1-02, 43-12.1-09; N.D. Admin. Code 54-05-03.1-09, 54-05-03.1-10, 54-05-03.1-12 (repealed)',
    sourceUrl: 'https://www.ndlegis.gov/information/acdata/pdf/54-05-03.1.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'ND',
    profession: 'PA',
    licensePath: 'PA; collaborative agreement only if under 4,000 hours at a board-approved site',
    board: 'North Dakota Board of Medicine',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a supervising physician; only PAs under 4,000 hours practicing at a board-approved non-facility site need a written collaborative agreement, with no on-site requirement.",
    conditions: [
      'Practice at licensed facility, credentialed facility, physician-owned practice, or board-approved site',
      'Board-approved independent site: rural underserved location, periodic physician chart review',
      'Under 4,000 hours at board-approved site: written collaborative agreement required',
    ],
    citation: 'NDCC 43-17-02.1(3), (5), (6); N.D. Admin. Code 50-03-01-03.1, 50-03-01-03.2',
    sourceUrl: 'https://www.ndlegis.gov/cencode/t43c17.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── NE ──
  {
    state: 'NE',
    profession: 'COUNSELING',
    licensePath: 'Provisional LMHP → LMHP → LIMHP',
    board: 'Nebraska Board of Mental Health Practice (DHHS Licensure Unit)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your weekly face-to-face supervision can be by secure, confidential live video, and the rules set no cap on video hours.',
    conditions: [
      'At least 1 hour of face-to-face evaluative supervision per week',
      'Video must be secure and confidential',
      'LIMHP track: 2 supervision hours per 15 major-mental-disorder client hours',
    ],
    citation: '172 NAC 94-009.01, 94-009.02, 94-009.03',
    sourceUrl: 'https://www.law.cornell.edu/regulations/nebraska/172-Neb-Admin-Code-ch-94-SS-009',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NE',
    profession: 'SOCIAL_WORK',
    licensePath: 'Provisional LMHP → LMHP + Certified Master Social Worker (CMSW)',
    board: 'Nebraska Board of Mental Health Practice (DHHS Licensure Unit)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your face-to-face supervision can happen over secure, confidential live video, and Nebraska rules set no cap on video hours.',
    conditions: [
      'At least 1 hour of face-to-face evaluative contact weekly',
      '3,000 supervised hours with a certified master social worker supervisor',
      'Video must be secure and confidential',
    ],
    citation: '172 NAC 94-009.01(C)(vi), 94-009.05, 94-008.01(C)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/nebraska/172-Neb-Admin-Code-ch-94-SS-009',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NE',
    profession: 'MFT',
    licensePath: 'Provisional LMHP → LMHP/LIMHP + Certified MFT (CMFT)',
    board: 'Nebraska Board of Mental Health Practice (DHHS Licensure Unit)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your face-to-face supervision can be done over secure, confidential live video, and Nebraska rules set no cap on video hours toward MFT certification.',
    conditions: [
      '100 supervisor contact hours within 3,000 total hours',
      'Supervision at least 1 hour weekly or 2 hours biweekly',
      'Supervisor must be AAMFT-approved or meet the Nebraska equivalent',
    ],
    citation: '172 NAC 94-009.01(C)(vi), 94-009.04, 94-008.01(B)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/nebraska/172-Neb-Admin-Code-ch-94-SS-009',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NE',
    profession: 'PSYCHOLOGY',
    licensePath: 'Provisional Psychologist → Licensed Psychologist',
    board: 'Nebraska Board of Psychology (DHHS Licensure Unit)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision meetings can be in person, by phone, or by video, with no cap, as long as the conversation stays confidential.',
    conditions: [
      'Meet at least twice monthly, minimum 4 total hours',
      'Must hold or have held a Nebraska provisional psychology license',
      '1,500 postdoctoral hours, including 1,000 direct service hours',
    ],
    citation: '172 NAC 155-011.01(B); 155-004.03(A)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/nebraska/172-Neb-Admin-Code-ch-155-SS-011',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NE',
    profession: 'NP',
    licensePath:
      'APRN-NP; transition-to-practice agreement for first 2,000 hours, then independent',
    board: 'Nebraska Board of Advanced Practice Registered Nurses / DHHS Licensure Unit',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Nebraska NPs practice independently after 2,000 hours; before that, your transition-to-practice supervisor only needs to be readily available for consultation, with no on-site requirement.',
    conditions: [
      '2,000-hour transition-to-practice agreement required for new NPs',
      'Supervisor must be licensed and practicing in Nebraska, same specialty',
      'Supervisor may be a physician or an NP with 10,000+ hours',
    ],
    citation: 'Neb. Rev. Stat. §§ 38-2317(1)(d), 38-2322(3); 172 NAC 98-003',
    sourceUrl: 'https://nebraskalegislature.gov/laws/statutes.php?statute=38-2322',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NE',
    profession: 'PA',
    licensePath: 'PA with collaborative agreement with a supervising physician',
    board: 'Nebraska Board of Medicine and Surgery / DHHS Licensure Unit',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervising physician can be remote: Nebraska law says supervision doesn't require their physical presence, and you may practice somewhere geographically remote from them.",
    conditions: [
      'Written collaborative agreement kept on file at each practice site',
      'Max 4 PAs per supervising physician (board may waive)',
      'Supervising physician needed for each employer and specialty area',
    ],
    citation: 'Neb. Rev. Stat. §§ 38-2047, 38-2050(3); 172 NAC 90-006',
    sourceUrl: 'https://nebraskalegislature.gov/laws/statutes.php?statute=38-2050',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── NH ──
  {
    state: 'NH',
    profession: 'COUNSELING',
    licensePath: 'Candidate for Licensure → LCMHC',
    board: 'New Hampshire Board of Mental Health Practice (OPLC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your weekly individual supervision can be in person or on a HIPAA-compliant video platform, with no cap on virtual hours.',
    conditions: [
      'At least 1 hour/week individual supervision, 100 hours total',
      'Video platform must be HIPAA compliant',
      'Supervision agreement must be board-approved before hours count',
    ],
    citation: 'N.H. Admin. Rules Mhp 305.03(d), (h); Mhp 301.01(c); Mhp 302.01; RSA 330-A:22, IV',
    sourceUrl: 'https://gc.nh.gov/rules/state_agencies/mhp300.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NH',
    profession: 'SOCIAL_WORK',
    licensePath: 'Candidate for Licensure (LSW/MSW) → LICSW',
    board: 'New Hampshire Board of Mental Health Practice (OPLC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your weekly individual supervision can be in person or on a HIPAA-compliant video platform, with no cap on virtual hours.',
    conditions: [
      'At least 1 hour/week individual supervision, 100 hours total',
      'Video platform must be HIPAA compliant',
      'Supervisor licensed in the state where supervision takes place',
    ],
    citation: 'N.H. Admin. Rules Mhp 304.02(a)(2), (d)(2)-(3); Mhp 301.01(c)',
    sourceUrl: 'https://gc.nh.gov/rules/state_agencies/mhp300.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NH',
    profession: 'MFT',
    licensePath: 'Candidate for Licensure → LMFT',
    board: 'New Hampshire Board of Mental Health Practice (OPLC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Individual supervision can be in person or by synchronous HIPAA-compliant video with no cap; confirm with the board before counting virtual group hours.',
    conditions: [
      '1 hour/week individual supervision; 200 hours from AAMFT-approved supervisor',
      'Outside AAMFT supervisor must visit your worksite twice a year',
      'Video must be synchronous and HIPAA compliant',
    ],
    citation: 'N.H. Admin. Rules Mhp 301.01(c), (d), (f); Mhp 306.02(a), (e), (f)',
    sourceUrl: 'https://gc.nh.gov/rules/state_agencies/mhp300.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NH',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral supervisee → Licensed Psychologist',
    board: 'New Hampshire Board of Psychologists (OPLC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Board rules define individual supervision as in-person or virtual, but an older rule says supervision occurs at your work site, so confirm with the board.',
    conditions: [
      'At least 1 hour/week and 50 hours of individual postdoc supervision',
      'Supervisor must be a licensed psychologist',
      'Records must show if supervised experience was in person or electronic',
    ],
    citation: 'N.H. Admin. Rules Psyc 301.01(b)-(c); Psyc 302.05(a)(2)-(3), (b)(1); Psyc 302.03(e)',
    sourceUrl: 'https://gc.nh.gov/rules/state_agencies/psyc100-500.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NH',
    profession: 'NP',
    licensePath: 'APRN (NP), full practice authority',
    board: 'New Hampshire Board of Nursing (OPLC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in New Hampshire don't need a collaborating physician, and there are no transition-to-practice hours.",
    conditions: [
      'No collaborating physician or transition-to-practice hours required',
      'Must hold current national certification in your APRN specialty',
      'Must consult with or refer to other providers as appropriate',
    ],
    citation:
      'N.H. RSA 326-B:11 (APRN scope and plenary prescriptive authority); RSA 326-B:18 (APRN licensure)',
    sourceUrl: 'https://gc.nh.gov/rsa/html/XXX/326-B/326-B-11.htm',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NH',
    profession: 'PA',
    licensePath: 'PA (physician associate) with collaboration agreement',
    board: 'New Hampshire Board of Medicine (OPLC)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your collaborating physician can be fully remote if they're reachable by phone or electronically, and with over 8,000 hours you can seek a board waiver until January 2027.",
    conditions: [
      'Written agreement needed under 8,000 hours if no NH physician in practice',
      'Over 8,000 hours: board waiver needed until Jan 1, 2027',
      'Collaborating physician must practice in a similar area of medicine',
    ],
    citation:
      'N.H. RSA 328-D:1 (definitions); RSA 328-D:3-b (scope of practice and collaboration agreement); N.H. Admin. Rules Med 602.02, 602.03, 610.02',
    sourceUrl: 'https://gc.nh.gov/rsa/html/XXX/328-D/328-D-3-b.htm',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── NJ ──
  {
    state: 'NJ',
    profession: 'COUNSELING',
    licensePath: 'LAC → LPC',
    board:
      'New Jersey Professional Counselor Examiners Committee (State Board of Marriage and Family Therapy Examiners)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'New Jersey requires weekly face-to-face supervision but does not say whether video counts, so confirm with the Committee before relying on video hours.',
    conditions: [
      'At least 50 supervision hours per year, one hour weekly',
      'No more than 10 hours per year may be group supervision',
      'Written supervision plan must be Committee-approved before counseling begins',
    ],
    citation: 'N.J.A.C. 13:34-10.2; 13:34-13.1',
    sourceUrl: 'https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-13-34-10-2',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NJ',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSW → LCSW',
    board: 'New Jersey State Board of Social Work Examiners',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video counts for no more than half of total supervision hours, and only for individual supervision.',
    summary:
      'You can do up to half of your supervision hours as individual supervision over HIPAA-compliant live video, and the rest must be face-to-face.',
    conditions: [
      'Video must be synchronous and HIPAA-compliant',
      'Only individual (not group) supervision may be done by video',
      'At least one hour of supervision per week',
    ],
    citation: 'N.J.A.C. 13:44G-8.1(b)1v',
    sourceUrl: 'https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-13-44G-8-1',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NJ',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board: 'New Jersey State Board of Marriage and Family Therapy Examiners',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Telesupervision is capped at half of supervision hours, after at least one in-person meeting.',
    summary:
      'You can do up to half of your supervision hours by live video, after at least one in-person meeting with your supervisor.',
    conditions: [
      'One in-person meeting with supervisor before any telesupervision',
      'Live two-way video required; audio-only phone does not count',
      'Supervisor must complete six hours of telesupervision training',
    ],
    citation: 'N.J.A.C. 13:34-2.4; 13:34-3.5',
    sourceUrl: 'https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-13-34-2-4',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NJ',
    profession: 'PSYCHOLOGY',
    licensePath: 'Supervised Permit Holder → Licensed Psychologist',
    board: 'New Jersey State Board of Psychological Examiners',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'New Jersey requires 100 hours of individual face-to-face supervision but does not say whether video counts, so confirm with the board first.',
    conditions: [
      '200 supervision hours within 1,750 hours of supervised experience',
      'At least 100 hours must be individual face-to-face supervision',
      'One supervision hour per five client-contact hours weekly',
    ],
    citation: 'N.J.A.C. 13:42-4.1(b)2',
    sourceUrl: 'https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-13-42-4-1',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NJ',
    profession: 'NP',
    licensePath: 'APN (NP) with joint protocol and collaborating physician',
    board: 'New Jersey Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your collaborating physician can be remote, as long as they're readily available electronically and you share a signed joint protocol for prescribing.",
    conditions: [
      'Written joint protocol required to prescribe; reviewed and signed annually',
      'You and the physician periodically review your patient charts',
      'Protocol must name how you reach the physician or peer coverage',
    ],
    citation: 'N.J.S.A. 45:11-49(b)-(c); N.J.A.C. 13:37-8.1',
    sourceUrl:
      'https://codes.findlaw.com/nj/title-45-professions-and-occupations/nj-st-sect-45-11-49.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NJ',
    profession: 'PA',
    licensePath: 'PA with supervising physician and delegation agreement',
    board: 'New Jersey State Board of Medical Examiners (Physician Assistant Advisory Committee)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can be off site, as long as supervision is continuous and you stay in contact electronically.',
    conditions: [
      'Max four PAs per supervising physician at one time',
      'Signed written delegation agreement with each supervising physician',
      'Agreement sets chart review, countersignature and practice locations',
    ],
    citation: 'N.J.S.A. 45:9-27.18(b); N.J.A.C. 13:35-2B.10',
    sourceUrl: 'https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-13-35-2B-10',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── NM ──
  {
    state: 'NM',
    profession: 'COUNSELING',
    licensePath: 'LMHC → LPCC',
    board: 'New Mexico Counseling and Therapy Practice Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can do your supervision in person or by secure video, because New Mexico rules count electronic supervision as appropriate supervision and set no cap on virtual hours.',
    conditions: [
      '100 supervision hours alongside 3,000 client contact hours for LPCC',
      "Supervisor must hold the board's registered supervisor designation",
      'Virtual hours must meet the same requirements as in-person supervision',
    ],
    citation: '16.27.1.7(J),(O) NMAC; 16.27.4.9 NMAC; 16.27.19.7(F) NMAC; 16.27.19.9(G) NMAC',
    sourceUrl: 'https://www.srca.nm.gov/parts/title16/16.027.0001.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NM',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'New Mexico Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Video supervision counts as direct, face-to-face supervision in New Mexico, and video hours have no cap beyond the general limits on group supervision.',
    conditions: [
      '90 supervision hours over 3,600 hours; at least 70 must be direct',
      'No more than 20 of the 90 hours may be group supervision',
      "Supervisor's board-submitted plan must state supervision type, including teleconferencing",
    ],
    citation: '16.63.1.7(A)(4),(6),(7) NMAC; 16.63.11.8 NMAC',
    sourceUrl: 'https://www.srca.nm.gov/parts/title16/16.063.0001.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NM',
    profession: 'MFT',
    licensePath: 'LAMFT → LMFT',
    board: 'New Mexico Counseling and Therapy Practice Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can do your supervision in person or by secure video, because New Mexico rules count electronic supervision as appropriate supervision and set no cap on virtual hours.',
    conditions: [
      '200 MFT supervision hours, at least 100 individual, plus 1,000 client hours',
      'Supervisor needs marriage and family therapy education and experience',
      'LAMFT plan: one hour of supervision per five client hours',
    ],
    citation: '16.27.1.7(J),(O) NMAC; 16.27.6.9 NMAC; 16.27.19.7(F) NMAC; 16.27.22.9 NMAC',
    sourceUrl: 'https://www.srca.nm.gov/parts/title16/16.027.0001.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NM',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral trainee → Licensed Psychologist',
    board: 'New Mexico State Board of Psychologist Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Live video supervision (telesupervision) counts the same as face-to-face supervision for your postdoctoral hours, with no cap.',
    conditions: [
      'At least one hour per week of one-to-one supervision (46 hours/year)',
      'Submit a postdoctoral supervisory plan stating the amount of telesupervision',
      'Telesupervision must be synchronous audio and video; telephonic is defined separately',
    ],
    citation: '16.22.6.9(B) NMAC; 16.22.6.10 NMAC; 16.22.1.7 NMAC',
    sourceUrl: 'https://www.srca.nm.gov/parts/title16/16.022.0006.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NM',
    profession: 'NP',
    licensePath: 'CNP with independent practice and prescriptive authority',
    board: 'New Mexico Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a collaborating physician in New Mexico; if you lack 400 recent prescribing hours, you first complete a 400-hour prescribing preceptorship.",
    conditions: [
      '400 prescribing hours within prior 2 years, or preceptorship',
      'Preceptorship with licensed CNP, CCNS or physician, within 6 months',
      'DEA holders: 5 contact hours non-cancer pain management per renewal',
    ],
    citation:
      '16.12.17.14(J)(2)(a), (L)(1), (L)(5)(a)(i) NMAC (eff. 1/1/2026); NMSA 1978 61-3-23.2(B)(2)',
    sourceUrl:
      'https://files.bon.nm.gov/Law%20%26%20Rules/Rules/16.12.17%20NMAC%20-%20Advanced%20Practice%20Registered%20Nurse%20%28APRN%29%20Licensure.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NM',
    profession: 'PA',
    licensePath: 'PA under supervision, or collaborating PA (primary care, 3+ years)',
    board: 'New Mexico Medical Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your supervising physician can be remote if reachable face-to-face or electronically; primary-care PAs with three years' experience may collaborate instead, with no physical presence required.",
    conditions: [
      'Collaboration: primary care only, after 3 years supervised practice',
      'Supervised PAs need quality assurance program and immediate communication means',
      'No fixed PA-to-physician ratio; physician must effectively supervise',
    ],
    citation:
      '16.10.15.7(C), (E) NMAC; 16.10.15.10-.12 NMAC; NMSA 1978 61-6C-6, 61-6C-8 (formerly 61-6-7.4, 61-6-10)',
    sourceUrl: 'https://www.srca.nm.gov/parts/title16/16.010.0015.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── NV ──
  {
    state: 'NV',
    profession: 'COUNSELING',
    licensePath: 'Clinical Professional Counselor Intern → LCPC',
    board:
      'Nevada State Board of Examiners for Marriage and Family Therapists and Clinical Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Nevada's board allows remote supervision and the regulations set no video-hour cap, but you still need weekly supervision with your primary supervisor.",
    conditions: [
      'At least 1 hour per week with your primary approved supervisor',
      '300 supervision hours: 160+ primary, 40+ secondary',
      'Both supervisors must be Board-approved before the internship starts',
    ],
    citation: 'NAC 641A.146, 641A.178; Board primary- and secondary-supervision guidance',
    sourceUrl: 'https://www.marriage.nv.gov/internship/primary-supervision/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NV',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW Clinical Intern → LCSW',
    board: 'Nevada Board of Examiners for Social Workers',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Weekly meetings may be by video, but an off-site supervisor must visit your internship site monthly unless the Board waives it.',
    summary:
      'Weekly supervision can be by video, but if your supervisor works off-site they must visit your internship site monthly unless the Board waives it.',
    conditions: [
      'Meet your supervisor individually at least 1 hour every week',
      '104 supervision hours total; no more than 24 may be group',
      'Hybrid site required; off-site supervisors need an on-site licensed professional',
    ],
    citation: 'NAC 641B.160(3)-(5); Board Clinical Internship Program Policy (amended June 2026)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/nevada/NAC-641B-160',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NV',
    profession: 'MFT',
    licensePath: 'MFT Intern → LMFT',
    board:
      'Nevada State Board of Examiners for Marriage and Family Therapists and Clinical Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Nevada's board allows remote supervision and the regulations set no video-hour cap, but you still need weekly supervision with your primary supervisor.",
    conditions: [
      'At least 1 hour per week with your primary approved supervisor',
      '300 supervision hours: 160+ primary, 40+ secondary',
      'Both supervisors must be Board-approved before the internship starts',
    ],
    citation: 'NAC 641A.146, 641A.178; Board primary- and secondary-supervision guidance',
    sourceUrl: 'https://www.marriage.nv.gov/internship/primary-supervision/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NV',
    profession: 'PSYCHOLOGY',
    licensePath: 'Provisionally Licensed Psychological Assistant → Licensed Psychologist',
    board: 'Nevada Board of Psychological Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can meet supervision requirements in person or by live video with no cap on video hours, but phone-only supervision does not count.',
    conditions: [
      'At least 1 hour individual supervision per 40 hours worked',
      'Supervisor or a backup provider must be available while you see clients',
      'Supervisor files a training plan when your provisional license issues',
    ],
    citation: 'NAC 641.15065, 641.152(8)(c), 641.157(2), 641.15195 (as amended by R041-25)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/nevada/NAC-641-15065',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'NV',
    profession: 'NP',
    licensePath: 'APRN (NP), independent practice',
    board:
      'Nevada State Board of Nursing (collaborating physicians are regulated by the Nevada State Board of Medical Examiners)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Applies only if you use a collaborating physician, e.g. for a Schedule II protocol. That physician must spend part of a day at your practice site at least once a month.',
    summary:
      "You don't need a collaborating physician in Nevada; if you use one for Schedule II prescribing, they can consult by phone but must visit your site monthly.",
    conditions: [
      'Collaborating physician needed only for Schedule II before 2 years/2,000 hours',
      'Collaborating physician must be available by phone whenever you see patients',
      'Physician notifies Medical Examiners Board first; limit of three APRNs/PAs',
    ],
    citation: 'NRS 632.237(3); NAC 630.490(3), (6)-(7); NAC 630.495',
    sourceUrl: 'https://www.leg.state.nv.us/NAC/NAC-630.html#NAC630Sec490',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NV',
    profession: 'PA',
    licensePath: 'PA with supervising physician',
    board:
      'Nevada State Board of Medical Examiners (allopathic); Nevada State Board of Osteopathic Medicine for DO-supervised PAs',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'The supervising physician must spend part of a day at least once a month at a location where the PA practices, which can be a site where the PA works by telehealth.',
    summary:
      'Your supervising physician can be remote and available by phone, but must visit your practice site part of a day at least once a month.',
    conditions: [
      'Monthly part-day on-site visit by supervising physician',
      'Physician available by phone at all times; reviews and initials selected charts',
      'Quality program with direct observation (by telehealth is acceptable)',
    ],
    citation: 'NAC 630.370(2)-(5), as amended by LCB File No. R033-24; NRS 630.271',
    sourceUrl: 'https://medboard.nv.gov/uploadedFiles/medboardnvgov/content/About/R033-24.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── OH ──
  {
    state: 'OH',
    profession: 'COUNSELING',
    licensePath: 'LPC → LPCC',
    board: 'Ohio Counselor, Social Worker and Marriage and Family Therapist Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person, by video, or by phone, and even the first meeting can be held over video.',
    conditions: [
      'Average 1 supervision hour per 20 work hours',
      'Supervisor must be an LPCC with supervision designation',
      'Initial face-to-face meeting required (video allowed)',
    ],
    citation: 'Ohio Admin. Code 4757-17-01(B)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/ohio/Ohio-Admin-Code-4757-17-01',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OH',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSW → LISW',
    board: 'Ohio Counselor, Social Worker and Marriage and Family Therapist Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Supervision must begin with a face-to-face meeting, then may continue by video or phone.',
    summary:
      'After your first face-to-face meeting with your supervisor, supervision can continue in person, by video, or by phone, with no cap on video hours.',
    conditions: [
      'Initial face-to-face meeting with supervisor required',
      '1 hour per 20 work hours, at least 150 hours total',
      'Supervisor must be an LISW with supervision designation',
    ],
    citation: 'Ohio Admin. Code 4757-23-01(A)(2), (F)(1)-(2)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/ohio/Ohio-Admin-Code-4757-23-01',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'OH',
    profession: 'MFT',
    licensePath: 'MFT → IMFT',
    board: 'Ohio Counselor, Social Worker and Marriage and Family Therapist Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person, by video, or by phone, and even the first meeting can be held over video.',
    conditions: [
      'Average 1 supervision hour per 20 work hours',
      'Supervisor: Ohio IMFT with designation, or AAMFT Approved Supervisor',
      'Initial face-to-face meeting required (video allowed)',
    ],
    citation: 'Ohio Admin. Code 4757-29-01(A)(2), (C)(1)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/ohio/Ohio-Admin-Code-4757-29-01',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OH',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral trainee → Psychologist',
    board: 'Ohio State Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Supervision can be in person or by live, real-time video, with no cap on video hours, if you and your supervisor follow the board's telesupervision rules.",
    conditions: [
      'Must use live, real-time audio and video',
      'Written telesupervision agreement with your supervisor required',
      'Supervisor decides case by case whether video is appropriate',
    ],
    citation: 'Ohio Admin. Code 4732-9-01(B)(2)(d)(viii); 4732-13-03(A)(2); 4732-13-04(B)(20)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/ohio/Ohio-Admin-Code-4732-9-01',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OH',
    profession: 'NP',
    licensePath: 'APRN-CNP with standard care arrangement',
    board: 'Ohio Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your collaborating physician can be remote, as long as they're continuously available to talk with you in person or by electronic communication.",
    conditions: [
      'Written standard care arrangement with a collaborating physician or podiatrist',
      'Random chart review incl. prescribing patterns at least annually',
      'Prescription/prescribing-pattern review at least semi-annually',
    ],
    citation:
      'Ohio Rev. Code 4723.01, 4723.431; Ohio Admin. Code 4723-8-01(B), 4723-8-04, 4723-8-05',
    sourceUrl: 'https://www.law.cornell.edu/regulations/ohio/Ohio-Admin-Code-4723-8-01',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'OH',
    profession: 'PA',
    licensePath: 'PA with supervision agreement',
    board: 'State Medical Board of Ohio',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Physician must be reachable in real time and close enough to assure proper patient care; first 500 prescribing hours require on-site supervision.',
    summary:
      'Your supervising physician can be remote by phone or video, but must be close enough to assure proper care, and your first 500 prescribing hours need on-site supervision.',
    conditions: [
      'First 500 hours of prescribing under on-site supervision',
      'Chart review twice yearly in first year, then annually',
      'Written supervision agreement with each supervising physician',
    ],
    citation:
      'Ohio Rev. Code 4730.21, 4730.44; Ohio Admin. Code 4730-1-01(B), 4730-1-05, 4730-2-04',
    sourceUrl: 'https://www.law.cornell.edu/regulations/ohio/Ohio-Admin-Code-4730-1-01',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── OK ──
  {
    state: 'OK',
    profession: 'COUNSELING',
    licensePath: 'LPC Candidate → LPC',
    board: 'Oklahoma State Board of Behavioral Health Licensure',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or over secure video, with no cap on video hours toward your 100 required supervision hours.',
    conditions: [
      'Video must run over secure internet connections',
      'At least 45 minutes of supervision every week',
      '100 supervision hours within the 3,000-hour experience',
    ],
    citation: 'OAC 86:10-1-2; 86:10-11-5',
    sourceUrl:
      'https://oklahoma.gov/content/dam/ok/en/behavioralhealth/documents/acts-and-regulations/UNOFFICIAL%20PERMANENT%20RULES_LPC_09-01-2026.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OK',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Oklahoma State Board of Licensed Social Workers',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your 100 required supervision hours can be in person or on electronic platforms, with no cap on virtual hours.',
    conditions: [
      '100 educational supervision hours within 3,000 clinical hours',
      'Supervisor must hold an LCSW license',
      'Supervision contract must be Board-approved before hours count',
    ],
    citation: 'OAC 675:1-1-1.1; 675:10-1-1.2; 675:12-1-2; 675:12-1-6',
    sourceUrl:
      'https://oklahoma.gov/content/dam/ok/en/socialworkers/documents/statutes-and-rules/Agency%20Rules%20Revised%202026%20-%2007%2009%202026.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OK',
    profession: 'MFT',
    licensePath: 'LMFT Candidate → LMFT',
    board: 'Oklahoma State Board of Behavioral Health Licensure',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or over secure video, with no cap on video hours toward your 100 required supervision hours.',
    conditions: [
      'Video must run over secure internet connections',
      'At least 45 minutes of supervision every week',
      '100 supervision hours within 3,000 hours over 24+ months',
    ],
    citation: 'OAC 86:15-1-3; 86:15-9-2; 86:15-9-4',
    sourceUrl:
      'https://oklahoma.gov/content/dam/ok/en/behavioralhealth/documents/acts-and-regulations/UNOFFICIAL%20PERMANENT%20RULES_LMFT_09-01-2026.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OK',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral candidate → Licensed Psychologist',
    board: 'Oklahoma State Board of Examiners of Psychologists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'No more than 50% of required individual and additional supervision hours may be virtual.',
    summary:
      'Up to half of your required supervision hours during internship and postdoc can be virtual, and the rest must be in person.',
    conditions: [
      'Postdoc needs 75 hours of formal individual supervision',
      'Individual supervision should be spread across each month',
      'Virtual cap applies to both internship and postdoc',
    ],
    citation: 'OAC 575:10-1-2(k)',
    sourceUrl: 'https://oklahoma.gov/psychology/about-the-board1/laws-rules.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OK',
    profession: 'NP',
    licensePath: 'APRN-CNP with prescriptive authority under physician supervision agreement',
    board:
      'Oklahoma Board of Nursing; State Board of Medical Licensure and Supervision / State Board of Osteopathic Examiners (supervising physicians)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can oversee your prescribing remotely by phone or electronic means, and after 6,240 supervised hours you can apply to prescribe independently.',
    conditions: [
      '6,240 supervised prescribing hours before applying for independent prescriptive authority',
      "Written supervision agreement filed with physician's board, naming alternate physicians",
      'Physician reviews prescribing patterns; continuous phone/electronic availability required',
    ],
    citation:
      '59 O.S. §§ 567.3a(11)-(12), 567.4a, 567.4c, 479.1 (HB 2298, Laws 2025, c. 340, eff. Nov. 1, 2025)',
    sourceUrl: 'https://www.oklegislature.gov/OK_Statutes/CompleteTitles/os59.rtf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OK',
    profession: 'PA',
    licensePath: 'PA with practice agreement (under 6,240 hours)',
    board:
      'Oklahoma State Board of Medical Licensure and Supervision (Physician Assistant Committee)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your delegating physician can supervise you remotely by telecommunication, and once you report 6,240 postgraduate hours to the Board you need no supervising physician.',
    conditions: [
      'Supervision required until 6,240 postgraduate hours are reported to Board',
      'Practice agreement filed with Medical Board within 10 business days',
      'Contact physician within 48 hours for newly diagnosed complex illnesses',
    ],
    citation: '59 O.S. §§ 519.2, 519.6 (as amended by HB 2584, Laws 2025, c. 343)',
    sourceUrl: 'https://www.oklegislature.gov/OK_Statutes/CompleteTitles/os59.rtf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── OR ──
  {
    state: 'OR',
    profession: 'COUNSELING',
    licensePath: 'Registered Associate → LPC',
    board: 'Oregon Board of Licensed Professional Counselors and Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live, confidential video, with no cap on virtual hours.',
    conditions: [
      'Meet at least twice monthly, in different weeks, one hour minimum',
      'At least 50% of monthly supervision hours must be individual',
      'Group supervision limited to six supervisees',
    ],
    citation: 'OAR 833-050-0081(5)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/oregon/Or-Admin-Code-SS-833-050-0081',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OR',
    profession: 'SOCIAL_WORK',
    licensePath: 'CSWA → LCSW',
    board: 'Oregon Board of Licensed Social Workers',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person, by secure video or by phone, with no cap on remote hours.',
    conditions: [
      '100 supervision hours over 24-60 months; at least 50 individual',
      'Meet a plan supervisor at least twice monthly, one hour minimum',
      'Remote sessions need client consent and secure, private transmission',
    ],
    citation: 'OAR 877-020-0010(3)(e); OAR 877-020-0012(9)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/oregon/Or-Admin-Code-SS-877-020-0010',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'OR',
    profession: 'MFT',
    licensePath: 'Registered Associate (MFT) → LMFT',
    board: 'Oregon Board of Licensed Professional Counselors and Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live, confidential video, with no cap on virtual hours.',
    conditions: [
      'Meet at least twice monthly, in different weeks, one hour minimum',
      'At least 50% of monthly supervision hours must be individual',
      'Supervisor training must include systems components',
    ],
    citation: 'OAR 833-050-0081(5)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/oregon/Or-Admin-Code-SS-833-050-0081',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OR',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychologist Resident → Licensed Psychologist',
    board: 'Oregon Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Individual and group supervision can be in person or by live, confidential video, with no cap on virtual hours.',
    conditions: [
      'Weekly supervision: 1 hour if working 1-20 hrs, 2 hours if more',
      'Requires a Board-approved Resident Supervision Contract',
      '1,500 supervised hours over at least 12 months (50 weeks)',
    ],
    citation: 'OAR 858-010-0036(2)(e)(D)',
    sourceUrl: 'https://www.oregon.gov/psychology/Documents/PermOAR_Filed_5-11-26.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OR',
    profession: 'NP',
    licensePath: 'Nurse Practitioner (APRN) license, independent practice',
    board: 'Oregon State Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Oregon don't need a collaborating or supervising physician; you practice and prescribe independently, with no transition-to-practice hours.",
    conditions: [
      'No physician agreement or transition-to-practice hours required',
      'Prescriptive authority from the Board needed to prescribe',
      'Must hold your own DEA registration for controlled substances',
    ],
    citation:
      'ORS 678.375; OAR 851-055-0010; OAR 851-055-0020; OAR 851-055-0070 (as amended eff. 1/1/2026)',
    sourceUrl: 'https://www.oregon.gov/osbn/Documents/Notice_Div45_49_55_Rulehearing10-25-25.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'OR',
    profession: 'PA',
    licensePath: 'Physician Associate (PA) with collaboration agreement',
    board: 'Oregon Medical Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote. If you have under 2,000 post-graduate hours, your agreement must include a regular collaboration plan, which can use technology.',
    conditions: [
      'Written collaboration agreement with a physician or employer required',
      'Under 2,000 post-grad hours: plan for regular collaboration with named physician',
      'Agreement kept at primary practice site; reviewed at performance assessment',
    ],
    citation: 'ORS 677.510; OAR 847-050-0080; OAR 847-050-0082',
    sourceUrl: 'https://www.law.cornell.edu/regulations/oregon/Or-Admin-Code-SS-847-050-0082',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── PA ──
  {
    state: 'PA',
    profession: 'COUNSELING',
    licensePath: 'Associate Professional Counselor → LPC',
    board:
      'State Board of Social Workers, Marriage and Family Therapists and Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You can do all supervision hours in person or by secure live video, with no cap on video; phone, email and chat don't count.",
    conditions: [
      'Must use HIPAA-compliant platform with synchronous audio and video',
      '2 supervision hours per 40 clinical hours; at least 1 individual',
      'Both parties in a private, professional setting, not public places',
    ],
    citation:
      '49 Pa. Code §49.13(b)(5); Board statement of policy interpreting "in person" (posted on pa.gov as §49.101, not codified)',
    sourceUrl:
      'https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/social-worker/swm%20-%20policy%20statement%20for%20section%2047.12cb%2048.13b%20and%2049.13b%20of%20the%20regulations.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'PA',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSW → LCSW',
    board:
      'State Board of Social Workers, Marriage and Family Therapists and Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You can do all supervision hours in person or by secure live video, with no cap on video; phone, email and chat don't count.",
    conditions: [
      'Must use HIPAA-compliant platform with synchronous audio and video',
      '2 supervision hours per 40 clinical hours; at least 1 individual',
      'Both parties in a private, professional setting, not public places',
    ],
    citation:
      '49 Pa. Code §47.12c(b)(5); Board statement of policy interpreting "in person" (posted on pa.gov as §47.101, not codified)',
    sourceUrl:
      'https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/social-worker/swm%20-%20policy%20statement%20for%20section%2047.12cb%2048.13b%20and%2049.13b%20of%20the%20regulations.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'PA',
    profession: 'MFT',
    licensePath: 'Associate MFT → LMFT',
    board:
      'State Board of Social Workers, Marriage and Family Therapists and Professional Counselors',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You can do all supervision hours in person or by secure live video, with no cap on video; phone, email and chat don't count.",
    conditions: [
      'Must use HIPAA-compliant platform with synchronous audio and video',
      '2 supervision hours per 40 clinical hours; at least 1 individual',
      'Both parties in a private, professional setting, not public places',
    ],
    citation:
      '49 Pa. Code §48.13(b)(5); Board statement of policy interpreting "in person" (posted on pa.gov as §48.101, not codified)',
    sourceUrl:
      'https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/social-worker/swm%20-%20policy%20statement%20for%20section%2047.12cb%2048.13b%20and%2049.13b%20of%20the%20regulations.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'PA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychology Resident → Licensed Psychologist',
    board: 'State Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your weekly individual supervision can be in person or by secure live video, with no cap on video; phone, email and chat don't count.",
    conditions: [
      'Average 2 hours per week of individual supervision',
      'Must use HIPAA-compliant platform with synchronous audio and video',
      'Both parties in a private, professional setting, not public places',
    ],
    citation:
      '49 Pa. Code §41.33(a)(5); Board statement of policy interpreting "face-to-face" (posted on pa.gov as §41.101, not codified)',
    sourceUrl:
      'https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/psychology/PsychSN%20-%20Policy%20Statement%20for%20Section%2041.33%20a%205%20of%20the%20Regulations.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'PA',
    profession: 'NP',
    licensePath:
      'CRNP with collaborative agreement (prescriptive authority agreement to prescribe)',
    board: 'Pennsylvania State Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your collaborating physician can be remote, as long as they're immediately reachable by phone or telecommunications and available on a regular schedule for consultation and chart review.",
    conditions: [
      'Written collaborative agreement naming at least one substitute physician',
      'Agreement must state how often physician personally sees patients',
      'Agreement reviewed at least every 2 years; copy filed with Bureau',
    ],
    citation:
      '49 Pa. Code § 21.251 (definition of collaboration); §§ 21.282a, 21.285; Professional Nursing Law, 63 P.S. § 218.2',
    sourceUrl:
      'https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/049/chapter21/s21.251.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'PA',
    profession: 'PA',
    licensePath:
      'PA with Board-filed written agreement with a supervising physician (MD primary supervisor)',
    board: 'Pennsylvania State Board of Medicine',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervising physician can be remote, as long as you two are, or can easily be, in contact with each other.',
    conditions: [
      '100% chart countersignature within 10 days for first 12 months',
      'Same 100% countersignature in first 12 months of a new specialty',
      'Written agreement filed with Board, naming a substitute supervising physician',
    ],
    citation:
      '49 Pa. Code §§ 18.122 (supervision), 18.142 (written agreements), as amended 55 Pa.B. 4534 (eff. July 5, 2025); Medical Practice Act, 63 P.S. § 422.13(e)',
    sourceUrl:
      'https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/049/chapter18/s18.122.html',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── RI ──
  {
    state: 'RI',
    profession: 'COUNSELING',
    licensePath: 'Clinical Mental Health Counselor Associate → LMHC',
    board:
      'Rhode Island Board of Mental Health Counselors and Marriage and Family Therapists (RIDOH)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Rhode Island requires 100 supervision hours over two years but never says whether they must be in person, so confirm with the board before counting video hours.',
    conditions: [
      '100 supervision hours spread over two years',
      '2,000 direct client contact hours post-degree',
      'Supervisor must be a board-approved supervisor',
    ],
    citation: '216-RICR-40-05-11.3.3(A)(3)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/rhode-island/216-RICR-40-05-11.3',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'RI',
    profession: 'SOCIAL_WORK',
    licensePath: 'LCSW → LICSW',
    board: 'Rhode Island Board of Social Work Examiners (RIDOH)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Rhode Island defines supervision as face-to-face contact but does not say whether video counts. Confirm with the board before relying on video hours.',
    conditions: [
      'At least 2 hours of supervision every two weeks',
      '1 supervision hour per 20 client-contact hours',
      'At least 75% individual; groups of 10 or fewer supervisees',
    ],
    citation: '216-RICR-40-05-7.3(A)(13); 7.4',
    sourceUrl: 'https://www.law.cornell.edu/regulations/rhode-island/216-RICR-40-05-7.3',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'RI',
    profession: 'MFT',
    licensePath: 'Associate MFT → LMFT',
    board:
      'Rhode Island Board of Mental Health Counselors and Marriage and Family Therapists (RIDOH)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Rhode Island requires 100 supervision hours over two years but never says whether they must be in person, so confirm with the board before counting video hours.',
    conditions: [
      '100 supervision hours spread over two years',
      '2,000 direct client contact hours with MFT emphasis',
      'Supervisor: AAMFT Approved Supervisor or qualified LMFT (5+ years)',
    ],
    citation: '216-RICR-40-05-11.3.6(A)(2)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/rhode-island/216-RICR-40-05-11.3',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'RI',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral trainee → Licensed Psychologist',
    board: 'Rhode Island Board of Psychology (RIDOH)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Rhode Island requires weekly one-to-one supervision during your postdoctoral year but never says whether it must be in person, so confirm with the board before relying on video.',
    conditions: [
      'Weekly one-to-one supervision of at least 1 hour',
      '3,000 hours over two years, 1,500 postdoctoral',
      'Supervisor must be a licensed psychologist',
    ],
    citation: '216-RICR-40-05-15.6(A)(5)(d)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/rhode-island/216-RICR-40-05-15.6',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'RI',
    profession: 'NP',
    licensePath: 'APRN (Certified Nurse Practitioner), independent practice',
    board: 'RI Board of Nurse Registration and Nursing Education (RI Department of Health)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Rhode Island don't need a collaborating physician. You can practice and prescribe, including Schedule II-V, without a written agreement or transition-to-practice hours.",
    conditions: [
      'No written collaborative agreement or designated physician required',
      'No transition-to-practice hours found in the current rule',
      'Prescribing includes Schedule II-V controlled substances',
    ],
    citation: 'R.I. Gen. Laws § 5-34-3; 216-RICR-40-05-3 §§ 3.2(A)(15), 3.2(A)(27), 3.7(B)',
    sourceUrl: 'https://rules.sos.ri.gov/regulations/part/216-40-05-3',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'RI',
    profession: 'PA',
    licensePath: 'PA practicing in collaboration with physicians',
    board: 'RI Board of Licensure of Physician Assistants (RI Department of Health)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote, as long as a physician is reachable at all times for consultation.',
    conditions: [
      'A physician must be accessible at all times for consultation',
      'Your practice or facility sets the degree of collaboration',
      'No physician ratio, chart review or on-site rules found',
    ],
    citation: 'R.I. Gen. Laws §§ 5-54-2(5), 5-54-8(a); 216-RICR-40-05-24 §§ 24.3(A)(8), 24.7',
    sourceUrl:
      'https://codes.findlaw.com/ri/title-5-businesses-and-professions/ri-gen-laws-sect-5-54-2/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── SC ──
  {
    state: 'SC',
    profession: 'COUNSELING',
    licensePath: 'LPC Associate (LPCA) → LPC',
    board:
      'South Carolina Board of Examiners for Licensure of Professional Counselors, Marriage and Family Therapists, Addiction Counselors and Psycho-Educational Specialists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over a HIPAA-compliant video platform, and the rules put no cap on virtual hours.',
    conditions: [
      '120 supervision hours over at least two years',
      'At least 60 hours individual/triadic; rest may be group',
      'Supervisor must be Board-approved before supervision begins',
    ],
    citation: 'S.C. Code Regs. 36-01(1), 36-05',
    sourceUrl: 'https://www.scstatehouse.gov/coderegs/Chapter%2036.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'SC',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LISW-CP',
    board: 'South Carolina Board of Social Work Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You can do your 100 face-to-face supervision hours over HIPAA-compliant two-way video, because the board's FAQ reads the statute that way.",
    conditions: [
      '100 face-to-face supervision hours within 3,000 practice hours',
      'Video must be a HIPAA-compliant two-way platform',
      'Supervision plan filed with the board before starting',
    ],
    citation: 'S.C. Code §40-63-240(A)(6)(b)-(c); SC Board of Social Work Examiners FAQ',
    sourceUrl: 'https://llr.sc.gov/sw/faq.aspx',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'SC',
    profession: 'MFT',
    licensePath: 'LMFT Associate → LMFT',
    board:
      'South Carolina Board of Examiners for Licensure of Professional Counselors, Marriage and Family Therapists, Addiction Counselors and Psycho-Educational Specialists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over a HIPAA-compliant video platform, and the rules put no cap on virtual hours.',
    conditions: [
      '120 supervision hours over at least two years',
      'At least 60 hours individual/triadic; rest may be group',
      'Supervisor must be Board-approved before supervision begins',
    ],
    citation: 'S.C. Code Regs. 36-01(1), 36-08',
    sourceUrl: 'https://www.scstatehouse.gov/coderegs/Chapter%2036.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'SC',
    profession: 'PSYCHOLOGY',
    licensePath: 'Supervised postdoctoral experience → Licensed Psychologist',
    board: 'South Carolina Board of Examiners in Psychology',
    remoteStatus: 'LIMITED',
    remoteLimit: 'At least 50% of supervision hours must be in person.',
    summary:
      'Up to half of your supervision hours can be by video, but at least 50% must be in person, plus one face-to-face hour every week.',
    conditions: [
      'At least 50% of supervision hours in person',
      'Minimum one hour of face-to-face supervision weekly',
      'Supervisor notifies the Board of the supervision agreement in advance',
    ],
    citation: 'S.C. Code Regs. 100-1(A)(5)',
    sourceUrl: 'https://www.scstatehouse.gov/coderegs/Chapter%20100.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'SC',
    profession: 'NP',
    licensePath: 'APRN (NP) with physician practice agreement',
    board: 'South Carolina Board of Nursing; Board of Medical Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your collaborating physician can be remote, as long as they're reachable in person or by phone/electronic means and actively practice in South Carolina.",
    conditions: [
      'Physician must hold SC license and actively practice within South Carolina',
      'Physician limited to six full-time-equivalent NPs/PAs combined',
      'Practice agreement reviewed and signed at least annually',
    ],
    citation: 'S.C. Code Ann. §§ 40-33-20(44), (52); 40-33-34(C)-(D); 40-47-195(D)',
    sourceUrl: 'https://www.scstatehouse.gov/code/t40c033.php',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'SC',
    profession: 'PA',
    licensePath: 'PA with supervising physician (scope of practice guidelines)',
    board: 'South Carolina Board of Medical Examiners (Physician Assistant Committee)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'PAs with under two years of continuous practice, or changing specialties, need 60 days on site with the physician first, unless the physician waives it in writing on a board form.',
    summary:
      "Your supervising physician can be off site and reachable by phone, but newer PAs first need 60 days working on site with them unless that's waived.",
    conditions: [
      "60 days on-site first if under 2 years' practice (waivable)",
      'Physician periodically reviews, initials and dates off-site PA charts',
      'Physician limited to six FTE PAs/NPs; must practice in SC',
    ],
    citation: 'S.C. Code Ann. §§ 40-47-910(4), 40-47-955(A), (C), 40-47-195(D)',
    sourceUrl: 'https://www.scstatehouse.gov/code/t40c047.php',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── SD ──
  {
    state: 'SD',
    profession: 'COUNSELING',
    licensePath: 'Post-graduate supervisee → LPC / LPC-MH',
    board: 'South Dakota Board of Examiners for Counselors and Marriage and Family Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live, real-time video, with no cap on virtual supervision hours.',
    conditions: [
      'Electronic supervision must be synchronous (real time)',
      'Board-approved plan of supervision and approved supervisor required first',
      'LPC only: max 400 direct client hours via telehealth',
    ],
    citation: 'ARSD 20:68:04:10; ARSD 20:73:04:08',
    sourceUrl: 'https://sdlegislature.gov/Rules/Administrative/20:68:04:10',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'SD',
    profession: 'SOCIAL_WORK',
    licensePath: 'CSW → CSW-PIP',
    board: 'South Dakota Board of Social Work Examiners',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "South Dakota rules require four hours of supervision a month but don't say whether video sessions count, so confirm with the board first.",
    conditions: [
      'Board-approved supervision agreement required before hours count',
      'Minimum four hours of individual supervision per month',
      'Group supervision capped at half of each six-month period',
    ],
    citation: 'ARSD 20:59:05:07; SDCL 36-26-17',
    sourceUrl: 'https://sdlegislature.gov/Rules/Administrative/20:59:05:07',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'SD',
    profession: 'MFT',
    licensePath: 'MFT supervisee (plan of supervision) → MFT (licensed)',
    board: 'South Dakota Board of Examiners for Counselors and Marriage and Family Therapists',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live, real-time video, with no cap on virtual supervision hours.',
    conditions: [
      'Electronic supervision must be synchronous (real time)',
      'Board-approved plan of supervision and approved supervisor required first',
      'No more than 1,000 direct client hours may be via telehealth',
    ],
    citation: 'ARSD 20:71:05:02',
    sourceUrl: 'https://sdlegislature.gov/Rules/Administrative/20:71:05:02',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'SD',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral psychology resident → Licensed Psychologist',
    board: 'South Dakota Board of Examiners of Psychologists',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      "Rules require two hours a month of 'face-to-face' postdoctoral supervision without saying whether video counts, so confirm with the board before relying on video hours.",
    conditions: [
      'Minimum two hours per month of formal, regularly scheduled supervision',
      'Supervisor must be a doctoral-level licensed psychologist',
      'Title must show training status, e.g. psychology resident',
    ],
    citation: 'ARSD 20:60:06:01; SDCL 36-27A-12(4)',
    sourceUrl: 'https://sdlegislature.gov/Rules/Administrative/20:60:06:01',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'SD',
    profession: 'NP',
    licensePath: 'CNP; collaborative agreement only for first 1,040 hours',
    board: 'South Dakota Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You need no collaborator after 1,040 practice hours, and before then South Dakota law requires no on-site presence, so your collaborator can be remote.',
    conditions: [
      'Collaborative agreement required for first 1,040 practice hours',
      'Collaborator: SD-licensed physician, NP, or CNM with unencumbered license',
      'Collaborator needs 2+ years practice in a comparable area',
    ],
    citation: 'SDCL 36-9A-1(6), (8); SDCL 36-9A-4; ARSD 20:62:02:02(7)',
    sourceUrl: 'https://sdlegislature.gov/Statutes/36-9A-4',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'SD',
    profession: 'PA',
    licensePath: 'PA with collaborative agreement (under 6,000 hours)',
    board: 'South Dakota Board of Medical and Osteopathic Examiners',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your collaborating physician doesn't need to be physically present, and once you have 6,000 practice hours plus NCCPA certification you don't need an agreement at all.",
    conditions: [
      'Agreement on board-approved form until 6,000-hour affidavit is filed',
      'Losing NCCPA certification requires a collaborative agreement again',
      'Facility/practice policies set the degree of collaboration',
    ],
    citation: 'SDCL 36-4A-1.1, 36-4A-1.2, 36-4A-26.1 (SL 2025 ch 149); ARSD 20:52:01:03',
    sourceUrl: 'https://sdlegislature.gov/Statutes/36-4A-26.1',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── TN ──
  {
    state: 'TN',
    profession: 'COUNSELING',
    licensePath: 'Temporary LPC/MHSP → LPC/MHSP',
    board:
      'Tennessee Board for Professional Counselors, Marital and Family Therapists, and Clinical Pastoral Therapists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Live video supervision counts only with prior board approval based on hardship; otherwise supervision is face-to-face.',
    summary:
      'Plan on in-person supervision. Live video counts only if the board approves it in advance because of a hardship.',
    conditions: [
      'Get board approval for hardship before counting any video hours',
      '150 supervision hours; no more than 50 in a group',
      'At least one hour of individual supervision per week',
    ],
    citation: 'Tenn. Comp. R. & Regs. 0450-01-.01(39)(b); 0450-01-.10(6)',
    sourceUrl: 'https://publications.tnsosfiles.com/rules/0450/0450-01.20200402.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'TN',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW → LCSW',
    board: 'Tennessee Board of Social Worker Licensure',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'No more than 75% of individual supervision hours may be by video or other visual technology.',
    summary:
      'Video supervision counts, but at most 75% of your individual supervision hours can be virtual; at least a quarter of individual hours must be in person.',
    conditions: [
      'At least 60 of 100 hours must be individual supervision',
      'Video must allow visual contact; no email, text or phone-only',
      'Supervisor must be an LCSW licensed at least 3 years',
    ],
    citation: 'Tenn. Comp. R. & Regs. 1365-01-.08(1)(c), (2)(a)3., (4)',
    sourceUrl: 'https://publications.tnsosfiles.com/rules/1365/1365-01.20240903.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'TN',
    profession: 'MFT',
    licensePath: 'Temporary LMFT → LMFT',
    board:
      'Tennessee Board for Professional Counselors, Marital and Family Therapists, and Clinical Pastoral Therapists',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Tennessee requires face-to-face MFT supervision but does not say whether live video counts. Confirm with the board before relying on video hours.',
    conditions: [
      'Supervisor must be an AAMFT Approved Supervisor or Supervisor-in-Training',
      'No more than half of supervision hours in a group',
      "Two years of post-master's supervised practice",
    ],
    citation: 'Tenn. Comp. R. & Regs. 0450-02-.01(35); 0450-02-.10(1)',
    sourceUrl: 'https://publications.tnsosfiles.com/rules/0450/0450-02.20200402.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'TN',
    profession: 'PSYCHOLOGY',
    licensePath: 'Provisional Psychologist (HSP) → Psychologist (HSP)',
    board: 'Tennessee Board of Examiners in Psychology',
    remoteStatus: 'LIMITED',
    remoteLimit: 'No more than 75% of supervision may be by real-time video conferencing.',
    summary:
      'Up to 75% of your supervision can be by real-time video; at least a quarter must be in person.',
    conditions: [
      'Video must be real-time with faces visible',
      'At least one hour of individual supervision per week',
      '1,900 postdoctoral hours under a psychologist with HSP designation',
    ],
    citation: 'Tenn. Comp. R. & Regs. 1180-02-.01(7)(d); 1180-02-.02(2)(d)1.',
    sourceUrl: 'https://publications.tnsosfiles.com/rules/1180/1180-02.20260727.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'TN',
    profession: 'NP',
    licensePath: 'APRN (NP) certificate of fitness with collaborating physician',
    board: 'Tennessee Board of Nursing; Tennessee Board of Medical Examiners',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'The physician must visit a remote site every 30 days. Up to 10 visits a year can be electronic; the rest must be in person.',
    summary:
      'Your collaborating physician can oversee you remotely, but must visit your site every 30 days, and only 10 visits a year may be electronic.',
    conditions: [
      'Physician reviews at least 20% of charts every 30 days',
      'Up to 10 of the yearly site visits may be by HIPAA-compliant video',
      'No full practice authority; collaboration required to prescribe',
    ],
    citation:
      'T.C.A. § 63-7-123(b)(7)(A)-(B); Tenn. Comp. R. & Regs. 0880-06-.02; 1000-04 (APRN prescribing)',
    sourceUrl:
      'https://codes.findlaw.com/tn/title-63-professions-of-the-healing-arts/tn-code-sect-63-7-123/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'TN',
    profession: 'PA',
    licensePath: 'PA license with collaborating physician (protocol/collaborative agreement)',
    board: 'Tennessee Board of Physician Assistants; Tennessee Board of Medical Examiners',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'The physician must visit a remote site every 30 days. Up to 10 visits a year can be electronic; the rest must be in person.',
    summary:
      'Your collaborating physician can oversee you remotely, but must visit your site every 30 days, and only 10 visits a year may be electronic.',
    conditions: [
      'Physician reviews at least 20% of charts every 30 days',
      'Up to 10 of the yearly site visits may be by HIPAA-compliant video',
      'Physician sets PA ratio at the practice level; no fixed cap',
    ],
    citation: 'T.C.A. § 63-19-107(10), (11)(A)-(B); Tenn. Comp. R. & Regs. 0880-02-.18',
    sourceUrl:
      'https://codes.findlaw.com/tn/title-63-professions-of-the-healing-arts/tn-code-sect-63-19-107/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── UT ──
  {
    state: 'UT',
    profession: 'COUNSELING',
    licensePath: 'ACMHC → CMHC',
    board:
      'Utah Division of Professional Licensing (DOPL), Clinical Mental Health Counselor Licensing Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video supervision has no hour cap, but the supervisor must physically visit your practice site at least quarterly unless DOPL approves less often.',
    summary:
      'Supervision can be in person or by live video with no hour cap, but your supervisor must visit your worksite at least once a quarter.',
    conditions: [
      'Supervision contract must include a written remote-supervision plan',
      'Supervisor visits your practice site at least quarterly',
      'Must be a W-2 employee at an approved agency setting',
    ],
    citation: 'Utah Admin. Code R156-60c-102(9); R156-60c-305b(3)(f)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R156-60c-305b',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'UT',
    profession: 'SOCIAL_WORK',
    licensePath: 'CSW → LCSW',
    board: 'Utah Division of Professional Licensing (DOPL), Social Work Licensing Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video supervision has no hour cap, but the supervisor must physically visit your practice site at least quarterly unless DOPL approves less often.',
    summary:
      'Supervision can be in person or by live video with no hour cap, but your supervisor must visit your worksite at least once a quarter.',
    conditions: [
      'Supervision contract must include a written remote-supervision plan',
      'Supervisor visits your practice site at least quarterly',
      'Must be a W-2 employee at an approved agency setting',
    ],
    citation: 'Utah Admin. Code R156-60a-102(9); R156-60a-305b(3)(f)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R156-60a-305b',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'UT',
    profession: 'MFT',
    licensePath: 'AMFT → LMFT',
    board:
      'Utah Division of Professional Licensing (DOPL), Marriage and Family Therapist Licensing Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video supervision has no hour cap, but the supervisor must physically visit your practice site at least quarterly unless DOPL approves less often.',
    summary:
      'Supervision can be in person or by live video with no hour cap, but your supervisor must visit your worksite at least once a quarter.',
    conditions: [
      'Supervision contract must include a written remote-supervision plan',
      'Supervisor visits your practice site at least quarterly',
      'Must be a W-2 employee at an approved agency setting',
    ],
    citation: 'Utah Admin. Code R156-60b-102(7); R156-60b-305b(3)(f)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R156-60b-305b',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'UT',
    profession: 'PSYCHOLOGY',
    licensePath: 'Certified Psychology Resident → Psychologist',
    board: 'Utah Division of Professional Licensing (DOPL), Psychologist Licensing Board',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video supervision counts only after DOPL approves a written remote supervision agreement that includes quarterly in-person site visits.',
    summary:
      'Video supervision counts once DOPL approves your remote supervision agreement, and your supervisor must visit your worksite at least once a quarter.',
    conditions: [
      'DOPL must approve remote agreement before any video hours count',
      'Video must be real-time with both audio and visual',
      'Supervisor visits your practice site at least quarterly',
    ],
    citation: 'Utah Admin. Code R156-61-102(7); R156-61-302b(6)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R156-61-302b',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'UT',
    profession: 'NP',
    licensePath: 'APRN (NP), independent practice',
    board:
      'Utah Division of Professional Licensing (DOPL) / Board of Nursing and Certified Nurse Midwives',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You don't need a collaborating physician in Utah; you can practice and prescribe, including Schedule II drugs, on your own.",
    conditions: [
      'No transition-to-practice hours or physician agreement required',
      'Schedule II prescribing allowed without a consultation and referral plan',
    ],
    citation: 'Utah Code 58-31b-803 (as amended 2023); Utah Code 58-31b-102',
    sourceUrl:
      'https://codes.findlaw.com/ut/title-58-occupations-and-professions/ut-code-sect-58-31b-803.html',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'UT',
    profession: 'PA',
    licensePath: 'PA with collaboration (practice-level policies / collaborative agreement)',
    board: 'Utah Division of Professional Licensing (DOPL) / Physician Assistant Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote; collaboration is required for your first 4,000 hours, and no agreement is needed after 10,000 hours.',
    conditions: [
      'First 4,000 post-graduate hours: collaborate with a physician',
      '4,000-10,000 hours: written agreement with physician or 10,000-hour PA',
      'Changing specialty: 4,000 hours collaboration with physician in new specialty',
    ],
    citation:
      'Utah Code 58-70a-307 (2021) and 58-70a-501 (2023); Utah Admin. Code R156-70a-501(2) (2018)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R156-70a-501',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── VA ──
  {
    state: 'VA',
    profession: 'COUNSELING',
    licensePath: 'Resident in Counseling → LPC',
    board: 'Virginia Board of Counseling',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can complete all 200 required supervision hours in person or over secure real-time video, with no cap on virtual hours.',
    conditions: [
      'Technology must be secure and maintain client confidentiality',
      'Must provide real-time visual contact (no phone/audio-only)',
      '1-4 supervision hours per 40 work hours; max half in group',
    ],
    citation: '18VAC115-20-52(B)(3)(b)',
    sourceUrl: 'https://law.lis.virginia.gov/admincode/title18/agency115/chapter20/section52/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'VA',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW (Supervisee in Social Work) → LCSW',
    board: 'Virginia Board of Social Work',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your required face-to-face supervision can happen in person or through real-time interactive technology such as video, with no cap on virtual hours.',
    conditions: [
      'Technology must allow real-time, interactive contact',
      '1-4 supervision hours per 40 work hours, 100 hours total',
      'No more than 50 of 100 hours in group supervision',
    ],
    citation: '18VAC140-20-10 ("face-to-face"); 18VAC140-20-50(A)(2)',
    sourceUrl: 'https://law.lis.virginia.gov/admincode/title18/agency140/chapter20/section10/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'VA',
    profession: 'MFT',
    licensePath: 'Resident in Marriage and Family Therapy → LMFT',
    board: 'Virginia Board of Counseling',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You can complete all 200 required supervision hours in person or over confidential real-time video, with no cap on virtual hours.',
    conditions: [
      'Technology must maintain client confidentiality',
      'Must provide real-time visual contact with supervisor',
      'At least 100 hours from an LMFT; max 100 in group',
    ],
    citation: '18VAC115-50-60(B)(1)',
    sourceUrl: 'https://law.lis.virginia.gov/admincode/title18/agency115/chapter50/section60/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'VA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Resident in Psychology → Licensed Clinical Psychologist',
    board: 'Virginia Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "You can likely use real-time video for residency supervision, since Virginia's rule sets no in-person requirement and board guidance allows synchronous telesupervision.",
    conditions: [
      'Telesupervision must be real-time (synchronous), per board guidance',
      'Two hours individual supervision per 40 residency hours',
      'Get written informed consent before telesupervision begins',
    ],
    citation: '18VAC125-20-65(B)(5); Board Guidance Doc. 125-7, §III(1)',
    sourceUrl: 'https://www.dhp.virginia.gov/media/dhpweb/docs/psych/guidance/125-7.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'VA',
    profession: 'NP',
    licensePath: 'Nurse Practitioner (APRN) with practice agreement; autonomous after 3 years',
    board: 'Virginia Board of Nursing and Board of Medicine (joint)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your collaborating physician can be remote, even by telemedicine. NPs with 3 years (5,400 hours) of full-time experience don't need one.",
    conditions: [
      'Autonomous practice after 3 years full-time (1,800 hrs/yr = 5,400 hrs)',
      'Practice agreement must provide for periodic physician chart review',
      'Physician site visits optional, at frequency the team sets',
    ],
    citation: 'Va. Code § 54.1-2957(C), (D), (I); 18VAC90-30-86; 18VAC90-30-120',
    sourceUrl: 'https://law.lis.virginia.gov/vacode/title54.1/chapter29/section54.1-2957/',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'VA',
    profession: 'PA',
    licensePath: 'PA with practice agreement on a patient care team',
    board: 'Virginia Board of Medicine',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote but must be available at all times. A 3-year independent-practice path is law but awaits Board regulations.',
    conditions: [
      'One physician may collaborate with at most 6 PAs at once',
      'Practice agreement must set a record-review timeframe and evaluation process',
      'Independent practice after 3 years (5,400 hrs), once Board regs adopted',
    ],
    citation:
      'Va. Code §§ 54.1-2952, 54.1-2952.01 (Acts 2026, c. 418); 18VAC85-50-101; 18VAC85-50-110',
    sourceUrl: 'https://law.lis.virginia.gov/admincode/title18/agency85/chapter50/section101/',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  // ── VT ──
  {
    state: 'VT',
    profession: 'COUNSELING',
    licensePath: 'Rostered Psychotherapist (supervisee) → LCMHC',
    board:
      'Vermont Board of Allied Mental Health Practitioners (Office of Professional Regulation)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Through December 31, 2026, your supervision can be in person, by phone, or by video, with no cap on virtual hours.',
    conditions: [
      'Board policy permitting remote supervision expires December 31, 2026',
      '100 face-to-face supervision hours, at least 50 individual',
      'At least 1 supervision hour per 30 practice hours',
    ],
    citation: '26 V.S.A. § 3265(2); AMH Rule 3.18; AMH Remote Supervision Policy (Dec. 1, 2025)',
    sourceUrl:
      'https://outside.vermont.gov/dept/sos/office_professional_regulation/professions/allied_mental_health/allied_mental_health_remote_pre-degree_internships_practicums_post-degree_supervision_policy.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'VT',
    profession: 'SOCIAL_WORK',
    licensePath: 'LMSW / Rostered Psychotherapist → LICSW',
    board: 'Vermont Office of Professional Regulation (Social Worker Advisors)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or over HIPAA-compliant video, with no cap on virtual hours.',
    conditions: [
      'At least 1 supervision hour per 30 practice hours',
      'At least half of supervision hours must be individual',
      'Video platform must be HIPAA compliant',
    ],
    citation: '26 V.S.A. § 3205a; Code Vt. R. 04-030-070, Rules 4.8–4.9',
    sourceUrl: 'https://www.law.cornell.edu/regulations/vermont/04-070-Code-Vt-R-04-030-070-X',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'VT',
    profession: 'MFT',
    licensePath: 'Rostered Psychotherapist (supervisee) → LMFT',
    board:
      'Vermont Board of Allied Mental Health Practitioners (Office of Professional Regulation)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Through December 31, 2026, your supervision can be in person, by phone, or by video, with no cap on virtual hours.',
    conditions: [
      'Board policy permitting remote supervision expires December 31, 2026',
      '100 face-to-face supervision hours, at least 50 individual',
      'At least 1 supervision hour per 30 practice hours',
    ],
    citation: '26 V.S.A. § 4037(3); AMH Rule 4.19; AMH Remote Supervision Policy (Dec. 1, 2025)',
    sourceUrl:
      'https://outside.vermont.gov/dept/sos/office_professional_regulation/professions/allied_mental_health/allied_mental_health_remote_pre-degree_internships_practicums_post-degree_supervision_policy.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'VT',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychological Trainee (Rostered Psychotherapist) → Licensed Psychologist',
    board: 'Vermont Board of Psychological Examiners (Office of Professional Regulation)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Through December 31, 2026, your supervision can be in person, by phone, or by video; after that, the rules require in-person individual supervision.',
    conditions: [
      'Board policy permitting remote supervision expires December 31, 2026',
      '2 supervision hours per 40 practice hours, one individual',
      'At least two supervisors, each covering 500+ hours',
    ],
    citation:
      '26 V.S.A. § 3011a; Code Vt. R. 04-030-270, Rules 4.1, 4.9 & 4.10; Board Policy Regarding On-Campus Presence and Remote Post-Degree Supervision (posted Oct. 2025)',
    sourceUrl:
      'https://outside.vermont.gov/dept/sos/office_professional_regulation/professions/psychological_examiner/psychological_examiner_covid-19_policy_remote_internships_practicum_campus_attendance_supervision.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'VT',
    profession: 'NP',
    licensePath: 'APRN (NP); collaborative provider agreement during transition to practice only',
    board: 'Vermont Board of Nursing (Office of Professional Regulation)',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Collaborator may be off-site, but during transition you cannot practice in a setting with no other APRNs or physicians.',
    summary:
      "During your first 24 months and 2,400 hours your collaborator can be remote, but you can't work alone; after that, no collaborator is needed.",
    conditions: [
      'Collaboration required until 24 months and 2,400 hours of practice',
      'Collaborator: APRN, MD or DO with 4+ years in your focus',
      'Other APRNs or physicians must be in your practice setting',
    ],
    citation: '26 V.S.A. § 1613; Vt. Admin. Code 04-030-170, Board of Nursing Rules §§ 9.8-9.10',
    sourceUrl: 'https://www.law.cornell.edu/regulations/vermont/04-170-Code-Vt-R-04-030-170-X',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'VT',
    profession: 'PA',
    licensePath: 'PA with written practice agreement with a participating physician',
    board: 'Vermont Board of Medical Practice',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Your physician can be remote: Vermont law doesn't require them to be physically present, only reachable by phone or electronically whenever you practice.",
    conditions: [
      'Physician reachable by phone/electronic means whenever you practice',
      'Practice agreement filed with Board; reviewed at least at renewal',
      'Physician or group must share a similar or related specialty',
    ],
    citation: '26 V.S.A. § 1735a (as amended by 2019 Act No. 123 (Adj. Sess.)); 26 V.S.A. § 1732',
    sourceUrl: 'https://legislature.vermont.gov/statutes/section/26/031/01735a',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── WA ──
  {
    state: 'WA',
    profession: 'COUNSELING',
    licensePath: 'LMHCA → LMHC',
    board:
      'Washington State Department of Health (Mental Health Counselors, Marriage and Family Therapists, and Social Workers Advisory Committee)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Washington defines your 100 required immediate-supervision hours as "a meeting" without saying in person or video, so confirm video hours with the Department of Health.',
    conditions: [
      '100 hours of immediate supervision within 3,000 postgraduate hours',
      'Immediate supervision: one supervisor, no more than two candidates',
      'Supervisor must be an approved supervisor under WAC 246-809-234',
    ],
    citation: 'WAC 246-809-210(5)-(6); WAC 246-809-230(3)',
    sourceUrl: 'https://app.leg.wa.gov/wac/default.aspx?cite=246-809-210',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WA',
    profession: 'SOCIAL_WORK',
    licensePath: 'LSWAIC → LICSW',
    board:
      'Washington State Department of Health (Mental Health Counselors, Marriage and Family Therapists, and Social Workers Advisory Committee)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be one-on-one or group, in person or virtual, with no cap on virtual hours.',
    conditions: [
      '100 supervision hours; 60 must be one-to-one',
      '70 supervision hours must be with an LICSW',
      '3,000 hours over at least two years',
    ],
    citation: 'WAC 246-809-310(4), (7); WAC 246-809-330(2)',
    sourceUrl: 'https://app.leg.wa.gov/wac/default.aspx?cite=246-809-310',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WA',
    profession: 'MFT',
    licensePath: 'LMFTA → LMFT',
    board:
      'Washington State Department of Health (Mental Health Counselors, Marriage and Family Therapists, and Social Workers Advisory Committee)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be one-on-one or group, in person or virtual, with no cap on virtual hours.',
    conditions: [
      '200 supervision hours; at least 100 one-on-one',
      "100 hours must be with an LMFT with two years' experience",
      '3,000 total hours including 1,000 direct client contact',
    ],
    citation: 'WAC 246-809-110(4), (6); WAC 246-809-130(3)',
    sourceUrl: 'https://app.leg.wa.gov/wac/default.aspx?cite=246-809-110',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WA',
    profession: 'PSYCHOLOGY',
    licensePath: 'Postdoctoral resident / Psychological Associate → Licensed Psychologist',
    board: 'Washington State Examining Board of Psychology',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Supervision can be in person or by live audio-video telesupervision, with no set limit on telesupervision hours.',
    conditions: [
      'Program needs a written telesupervision policy',
      'Supervisor must judge you competent enough for telesupervision',
      'Your client work cannot be done entirely by telehealth',
    ],
    citation: 'WAC 246-924-051; WAC 246-924-059(4), (12)',
    sourceUrl: 'https://app.leg.wa.gov/wac/default.aspx?cite=246-924-051',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WA',
    profession: 'NP',
    licensePath: 'ARNP (CNP), independent practice',
    board: 'Washington State Nursing Care Quality Assurance Commission',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Washington don't need a collaborating physician. You practice and prescribe independently from day one, with no transition-to-practice hours.",
    conditions: [
      'No physician agreement or transition-to-practice hours required',
      'Prescriptive authority must be granted by the nursing commission',
      'Title changes to APRN effective June 30, 2027',
    ],
    citation: 'RCW 18.79.250; WAC 246-840-300',
    sourceUrl: 'https://app.leg.wa.gov/wac/default.aspx?cite=246-840-300',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WA',
    profession: 'PA',
    licensePath: 'PA with collaboration agreement',
    board: 'Washington Medical Commission',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your participating physician can be remote. Contact by phone or electronically is fine, and PAs with 4,000+ hours move from supervision to collaboration.',
    conditions: [
      'Collaboration agreement naming a participating physician required before practice',
      'Under 4,000 postgraduate hours (or first 2,000 in new specialty): supervision',
      'General/intrathecal anesthesia requires direct anesthesiologist supervision',
    ],
    citation: 'RCW 18.71A.030(2)(c); RCW 18.71A.120(2)(b); WAC 246-918-055',
    sourceUrl: 'https://app.leg.wa.gov/rcw/default.aspx?cite=18.71A.030',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── WI ──
  {
    state: 'WI',
    profession: 'COUNSELING',
    licensePath: 'Professional Counselor Training License → LPC',
    board:
      'Marriage and Family Therapy, Professional Counseling, and Social Work Examining Board (Professional Counselor Section)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Wisconsin requires face-to-face supervision, one hour per 40 practice hours, but never says whether live video counts, so confirm with the board before relying on video.',
    conditions: [
      'One face-to-face supervision hour per 40 practice hours, averaged',
      'Group capped at 6, plus one individual face-to-face hour weekly',
      'Must hold a Professional Counselor Training License while accruing hours',
    ],
    citation:
      'Wis. Admin. Code MPSW 12.01(1), 12.02(2)(a), (3)(a), (3)(d), as amended by CR 25-091 (eff. 10/1/2026)',
    sourceUrl:
      'https://dsps.wi.gov/MediaFileLocation/a3efkt2q/2026-april-22-professional-counselor-agenda.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WI',
    profession: 'SOCIAL_WORK',
    licensePath: 'APSW / Social Worker Training Certificate → LCSW',
    board:
      'Marriage and Family Therapy, Professional Counseling, and Social Work Examining Board (Social Worker Section)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Wisconsin requires face-to-face supervision, one hour per 40 practice hours, but does not say whether live video qualifies, so confirm with the board first.',
    conditions: [
      'One face-to-face supervision hour per 40 practice hours, averaged',
      'Group capped at 6, plus one individual face-to-face hour weekly',
      'Supervisor: qualifying LCSW, psychiatrist, psychologist, or section-approved',
    ],
    citation:
      'Wis. Admin. Code MPSW 4.01(1)-(2), 4.02(2)(a), (3), as repealed and recreated by CR 25-091 (eff. 10/1/2026)',
    sourceUrl:
      'https://dsps.wi.gov/MediaFileLocation/a2slvfpt/2026-april-22-social-worker-agenda.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WI',
    profession: 'MFT',
    licensePath: 'MFT Training License → LMFT',
    board:
      'Marriage and Family Therapy, Professional Counseling, and Social Work Examining Board (Marriage and Family Therapist Section)',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Wisconsin requires one face-to-face supervision hour per 10 client contact hours but does not say whether live video counts, so confirm with the board first.',
    conditions: [
      'One face-to-face supervision hour per 10 client contact hours',
      'Group supervision capped at 6 supervisees per supervisor',
      'Group participants also need one individual face-to-face hour weekly',
    ],
    citation:
      'Wis. Admin. Code MPSW 16.04(1), 16.05(2)(a), (3), as recreated or created by CR 25-091 (eff. 10/1/2026)',
    sourceUrl:
      'https://dsps.wi.gov/MediaFileLocation/454hiywx/2026-april-23-marriage-family-therapy-agenda.pdf',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WI',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychological Trainee / Interim Psychologist → Psychologist',
    board: 'Psychology Examining Board',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Wisconsin requires 3,000 supervised hours but does not say whether supervision must be in person, so confirm with the board before relying on video supervision.',
    conditions: [
      '3,000 supervised hours, including a 1,500-hour internship',
      'At least 25% of hours must be face-to-face client contact',
      'Primary supervisor must be a licensed psychologist with post-licensure experience',
    ],
    citation: 'Wis. Admin. Code Psy 2.10',
    sourceUrl: 'https://www.law.cornell.edu/regulations/wisconsin/Wis-Admin-Code-SS-Psy-2-10',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WI',
    profession: 'NP',
    licensePath:
      'APRN (NP) with collaborative relationship, or independent practice after board verification',
    board: 'Wisconsin Board of Nursing (DSPS)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can work with you remotely and be physically present only when necessary; after 3,840 collaborative hours you can apply for independent practice.',
    conditions: [
      'Independence: 3,840 APRN hours with a physician, over at least 24 months',
      'Also 3,840 clinical nursing hours; extra APRN hours can substitute',
      'Invasive pain treatment requires a pain-specialist collaborating physician',
    ],
    citation: 'Wis. Stat. § 441.09(3m)(a)1., (b), (bg), (bm) (2025 Wis. Act 17, eff. 9-1-2026)',
    sourceUrl: 'https://docs.legis.wisconsin.gov/statutes/statutes/441/i/09',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WI',
    profession: 'PA',
    licensePath: 'PA with written collaborative agreement or physician-directed employment',
    board: 'Physician Assistant Affiliated Credentialing Board (DSPS)',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your collaborating physician can be remote, as long as they stay reasonably available by phone or electronically within a medically appropriate time frame.',
    conditions: [
      'Written collaborative agreement, or employment with a responsible physician',
      'Agreement must include a protocol for an alternate collaborating physician',
      'Patient can request physician consultation within an appropriate time frame',
    ],
    citation:
      'Wis. Stat. § 448.975(2)(a)1., 1m.b.-c., 2. (2021 Wis. Act 23; 2023 Wis. Act 87); Wis. Admin. Code § PA 3.01(3)',
    sourceUrl: 'https://docs.legis.wisconsin.gov/statutes/statutes/448/ix/975',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── WV ──
  {
    state: 'WV',
    profession: 'COUNSELING',
    licensePath: 'LPC-Associate → LPC',
    board: 'West Virginia Board of Examiners in Counseling',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over any secure, encrypted video or telecommunication platform, and the rules set no cap on virtual hours.',
    conditions: [
      'Hold an LPC-Associate license with a Board pre-approved supervisor',
      'At least 1 hour direct supervision per 20 practice hours',
      'Supervisors outside your agency must meet with you twice monthly',
    ],
    citation: '27 CSR 1 §§2.4, 6.2.3, 6.2.4, 7.1',
    sourceUrl: 'https://apps.sos.wv.gov/adlaw/csr/readfile.aspx?DocId=58875&Format=PDF',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WV',
    profession: 'SOCIAL_WORK',
    licensePath: 'LGSW/LCSW → LICSW',
    board: 'West Virginia Board of Social Work',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your face-to-face clinical supervision sessions can happen over HIPAA-compliant video, and the rules set no cap on virtual hours.',
    conditions: [
      '100 supervision hours over 2+ years or 3,000 practice hours',
      'At least 50% of supervision must be individual, not group',
      'Board must approve the supervision contract before supervision starts',
    ],
    citation: '25 CSR 1 §§3.6.1.d, 3.6.1.e',
    sourceUrl: 'https://apps.sos.wv.gov/adlaw/csr/readfile.aspx?DocId=55239&Format=WORD',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WV',
    profession: 'MFT',
    licensePath: 'LMFT-Associate → LMFT',
    board: 'West Virginia Board of Examiners in Counseling',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'Your supervision can be in person or over any secure, encrypted video or telecommunication platform, and the rules set no cap on virtual hours.',
    conditions: [
      'Hold an LMFT-Associate license with a Board pre-approved supervisor',
      'At least 1 hour individual supervision per 20 practice hours',
      'Supervisors outside your agency must meet with you twice monthly',
    ],
    citation: '27 CSR 8 §§2.5, 6.2.1.e, 6.2.1.f, 7.1',
    sourceUrl: 'https://apps.sos.wv.gov/adlaw/csr/readfile.aspx?DocId=58877&Format=PDF',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WV',
    profession: 'PSYCHOLOGY',
    licensePath: 'Supervised-Psychologist → Licensed Psychologist',
    board: 'West Virginia Board of Examiners of Psychologists',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Video needs Board approval in your supervision contract, and at least one individual session per quarter must be in person at your work site.',
    summary:
      'Your individual supervision is in person by default, but video can count if the Board approves it in your contract, plus one on-site session each quarter.',
    conditions: [
      'Video must be Board-approved and written into the supervision contract',
      'One in-person individual session per quarter at your service location',
      '1 hour individual supervision per 20 practice hours, at least weekly',
    ],
    citation: '17 CSR 2 §6.4 (Supervision Contract); 17 CSR 3 §§8.5, 9.2',
    sourceUrl: 'https://apps.sos.wv.gov/adlaw/csr/readfile.aspx?DocId=57450&Format=WORD',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WV',
    profession: 'NP',
    licensePath: 'APRN (CNP); collaborative agreement needed only for prescribing',
    board: 'West Virginia Board of Registered Professional Nurses',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      'You need a collaborating physician only to prescribe; no rule requires them on site, they may hold a neighboring-state license, and none is needed after three years.',
    conditions: [
      'Collaboration required only for prescribing; independent after 3 collaborative years',
      'Physician may hold WV, contiguous-state, or VA license',
      'Agreement needs periodic joint evaluation of prescribing practice',
    ],
    citation:
      'W. Va. Code §30-7-15b; W. Va. Code R. §19-8-3.1.f.2 and 3.1.f.3 (19CSR8, eff. 4/24/2023)',
    sourceUrl: 'https://apps.sos.wv.gov/adlaw/csr/readfile.aspx?DocId=56091&Format=WORD&KeyWord=',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WV',
    profession: 'PA',
    licensePath: 'PA-C with active practice notification (collaboration)',
    board: 'West Virginia Board of Medicine / West Virginia Board of Osteopathic Medicine',
    remoteStatus: 'LIMITED',
    remoteLimit:
      'Physician need not be constantly on site, but collaboration cannot occur exclusively by written or electronic/telecommunication; some in-person collaboration required.',
    summary:
      'Your collaborating physician need not be on site and can reach you by phone or video, but collaboration cannot happen entirely through electronic or written communication.',
    conditions: [
      'PA and health care facility file practice notification; board must activate it',
      'Collaborating MD/DO/DPM needs a full, unrestricted WV license',
      'Some collaboration must occur in person, not solely electronic or written',
    ],
    citation:
      'W. Va. Code §30-3E-1, §30-3E-10a; W. Va. Code R. §11-1B-2.5, §11-1B-13 (11CSR1B, eff. 7/1/2026); W. Va. Code R. §24-2-13.4 (24CSR2, eff. 7/2/2026)',
    sourceUrl: 'https://apps.sos.wv.gov/adlaw/csr/readfile.aspx?DocId=58892&Format=WORD&KeyWord=',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  // ── WY ──
  {
    state: 'WY',
    profession: 'COUNSELING',
    licensePath: 'Provisional Professional Counselor → LPC',
    board: 'Wyoming Mental Health Professions Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Individual supervision by phone or video counts with no cap on hours; two-supervisee sessions must be in person, and larger groups don't count.",
    conditions: [
      'At least 1 supervision hour per 20 direct clinical hours, monthly',
      'Distance supervision must be individual (one supervisee)',
      '100 post-graduate supervision hours with a board-approved DQCS',
    ],
    citation: 'WY Admin. Rules 078.0001 Ch. 18 §§5(b), 6; Ch. 1 §3(m); Ch. 11 §4',
    sourceUrl: 'https://rules.wyo.gov/Search.aspx?RefNum=078.0001.18.12172021',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WY',
    profession: 'SOCIAL_WORK',
    licensePath: 'Provisional Clinical Social Worker → LCSW',
    board: 'Wyoming Mental Health Professions Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Individual supervision by phone or video counts with no cap on hours; two-supervisee sessions must be in person, and larger groups don't count.",
    conditions: [
      'At least 1 supervision hour per 20 direct clinical hours, monthly',
      'Distance supervision must be individual (one supervisee)',
      '100 post-graduate supervision hours with a board-approved DQCS',
    ],
    citation: 'WY Admin. Rules 078.0001 Ch. 18 §§5(b), 6; Ch. 1 §3(m); Ch. 9 §4',
    sourceUrl: 'https://rules.wyo.gov/Search.aspx?RefNum=078.0001.18.12172021',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WY',
    profession: 'MFT',
    licensePath: 'Provisional Marriage and Family Therapist → LMFT',
    board: 'Wyoming Mental Health Professions Licensing Board',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Individual supervision by phone or video counts with no cap on hours; two-supervisee sessions must be in person, and larger groups don't count.",
    conditions: [
      'At least 1 supervision hour per 20 direct clinical hours, monthly',
      'Distance supervision must be individual (one supervisee)',
      '100 post-graduate supervision hours with a board-approved DQCS',
    ],
    citation: 'WY Admin. Rules 078.0001 Ch. 18 §§5(b), 6; Ch. 1 §3(m); Ch. 10 §4',
    sourceUrl: 'https://rules.wyo.gov/Search.aspx?RefNum=078.0001.18.12172021',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WY',
    profession: 'PSYCHOLOGY',
    licensePath: 'Psychological Resident → Licensed Psychologist',
    board: 'Wyoming State Board of Psychology',
    remoteStatus: 'NOT_SPECIFIED',
    remoteLimit: null,
    summary:
      'Wyoming requires at least one hour of face-to-face supervision weekly but never says whether video counts, so confirm with the board before relying on video hours.',
    conditions: [
      'At least 1 hour of face-to-face supervision per week',
      'Board-approved supervision plan before providing services',
      'Supervisor must be licensed with 2+ years of independent practice',
    ],
    citation: 'WY Admin. Rules 068.0001 Ch. 14 §3(g); Ch. 5 §5(b)',
    sourceUrl: 'https://rules.wyo.gov/Search.aspx?RefNum=068.0001.14.10022025',
    lastVerified: VERIFIED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WY',
    profession: 'NP',
    licensePath: 'APRN (NP) with full practice authority',
    board: 'Wyoming State Board of Nursing',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "NPs in Wyoming don't need a collaborating physician; you can practice and prescribe independently with no transition-to-practice hours.",
    conditions: [
      'No collaborative agreement or transition-to-practice hours required',
      'Must hold Board-recognized APRN role and population focus',
      'Prescriptive authority granted by the Board, incl. controlled substances',
    ],
    citation: 'Wyo. Stat. 33-21-120(a)(i), 33-21-158; Wyo. Code R. 054-0002-3 § 3-3',
    sourceUrl: 'https://wyoleg.gov/statutes/compress/title33.pdf',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
  {
    state: 'WY',
    profession: 'PA',
    licensePath: 'PA-C (NCCPA-certified), no supervision agreement',
    board: 'Wyoming Board of Medicine',
    remoteStatus: 'ALLOWED',
    remoteLimit: null,
    summary:
      "Certified PAs in Wyoming don't need a supervising physician; how much you collaborate is decided by your practice, so a remote physician is fine.",
    conditions: [
      'Supervision agreements for NCCPA-certified PAs terminated January 1, 2022',
      'Degree of collaboration set at practice level (employer, hospital privileging)',
      'Temporary-license PAs not yet certified still need board-approved supervision',
    ],
    citation: 'Wyo. Stat. 33-26-502(b), 33-26-504(c); Wyo. Code R. 052-0001-5 § 5-20(g)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/wyoming/W-S-5-20',
    lastVerified: VERIFIED,
    confidence: 'HIGH',
  },
]
