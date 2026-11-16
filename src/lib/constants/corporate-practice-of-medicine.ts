/**
 * Per-state Corporate Practice of Medicine (CPOM) status, shown on the public
 * /medical-directors/[state] pages for people looking to hire a Medical
 * Director (med spa, clinic, and practice owners).
 *
 * CPOM rules decide whether a non-physician (or a regular business
 * corporation) can own a practice that provides medical care and employ or
 * contract a physician. Each entry is sourced (statute, Attorney General
 * opinion, court decision, board rule, or a reputable health-law survey when no
 * primary source states the rule) and carries a "last reviewed" date.
 *
 * Informational only, not legal advice: never use this to hide or block
 * Medical Directors.
 *
 * Internal reviewer notes per state live in ./corporate-practice-of-medicine-notes,
 * kept out of this module because the state checker loads it in the browser.
 */

/**
 * - STRICT: non-physicians generally cannot own a medical practice or employ
 *   physicians; owners typically use a physician-owned professional entity,
 *   often with a management services organization (MSO).
 * - EXCEPTIONS: a CPOM doctrine exists but with significant exceptions or weak
 *   enforcement, so the answer depends on the setup.
 * - PERMISSIVE: no meaningful CPOM prohibition.
 */
export type CorporatePracticeStatus = 'STRICT' | 'EXCEPTIONS' | 'PERMISSIVE'

export interface CorporatePracticeRule {
  /** US state code, matches the state option `value` (e.g. "TX"). */
  state: string
  status: CorporatePracticeStatus
  /** Plain-English summary shown to people looking for a Medical Director. */
  summary: string
  citation: string
  sourceUrl: string
  /** Link text for sourceUrl. */
  sourceLabel: string
  /** ISO date the entry was last checked against the source. */
  lastReviewed: string
  /** Internal: MEDIUM/LOW entries should be re-checked first. */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

const REVIEWED = '2026-10-27'

export const CORPORATE_PRACTICE_RULES: CorporatePracticeRule[] = [
  {
    state: 'AL',
    status: 'PERMISSIVE',
    summary:
      'Alabama does not prohibit the corporate practice of medicine. A business owned by a non-physician can generally employ a physician, as long as the physician keeps full control over medical decisions.',
    citation:
      "Ala. Code §§ 34-24-51, 34-24-360; Ala. Bd. of Med. Exam'rs and Med. Licensure Comm'n Declaratory Rulings (Oct. 1992)",
    sourceUrl: 'https://www.albme.gov/uploads/files/2-1195.pdf',
    sourceLabel: 'Alabama Medical Licensure Commission: Declaratory Ruling on physician employment',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'AK',
    status: 'PERMISSIVE',
    summary:
      'Alaska has no statute or court decision banning the corporate practice of medicine. Non-physicians can generally own a clinic or med spa and hire or contract a Medical Director, who must keep control of clinical decisions.',
    citation:
      'Alaska Stat. § 08.64.170 (licensure only); Alaska Stat. ch. 10.45 (professional corporations)',
    sourceUrl:
      'https://ndlegis.gov/assembly/68-2023/testimony/HHUMSER-2148-20230308-22757-F-KOEBELE_COURTNEY.pdf',
    sourceLabel: 'State CPOM Doctrines survey (N.D. Legislature testimony, 2023)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AZ',
    status: 'EXCEPTIONS',
    summary:
      "Arizona's corporate practice of medicine doctrine is weak, and its courts have allowed a licensed clinic owned by a non-physician to employ doctors. Many med spas are owned by non-physicians, but the right setup depends on facility licensing and clinical control, so a legal review is a good idea.",
    citation:
      'Midtown Med. Grp., Inc. v. State Farm, 220 Ariz. 341, 206 P.3d 790 (App. 2008); Funk Jewelry Co. v. State ex rel. La Prade, 50 P.2d 945 (Ariz. 1935)',
    sourceUrl: 'https://caselaw.findlaw.com/court/az-court-of-appeals/1024538.html',
    sourceLabel: 'Midtown Medical Group v. State Farm (Ariz. Ct. App. 2008)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'AR',
    status: 'STRICT',
    summary:
      'Arkansas generally follows the corporate practice of medicine doctrine through Attorney General opinions and its Medical Corporation Act. Non-physician owners typically use a physician-owned practice with a separate management company, and state guidance notes some uncertainty, so a legal review is a good idea.',
    citation:
      "Ark. Code Ann. §§ 4-29-305, 4-29-307, 17-95-202; Ark. Att'y Gen. Ops. 94-204 (1994), 2014-118 (2015)",
    sourceUrl:
      'https://healthy.arkansas.gov/wp-content/uploads/OwnershipofMedicalPracticesinArkansas1.15.26.pdf',
    sourceLabel: 'Arkansas Department of Health: Ownership of Medical Practices in Arkansas',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'CA',
    status: 'STRICT',
    summary:
      'California strictly prohibits the corporate practice of medicine. A non-physician generally cannot own a med spa that provides medical services, so owners typically use a physician-owned medical corporation with a separate management company.',
    citation: 'Cal. Bus. & Prof. Code §§ 2052, 2400; SB 351 (2025)',
    sourceUrl: 'https://www.mbc.ca.gov/Licensing/Physicians-and-Surgeons/Practice-Information/',
    sourceLabel: 'Medical Board of California: Corporate Practice of Medicine',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'CO',
    status: 'STRICT',
    summary:
      'Colorado prohibits the corporate practice of medicine, with exceptions mainly for hospitals and certain other licensed health facilities. A non-physician generally cannot own a med spa that employs a physician, so owners typically use a physician-owned professional entity with a separate management company.',
    citation: 'C.R.S. §§ 12-240-138(6), 25-3-103.7',
    sourceUrl: 'https://colorado.public.law/statutes/crs_12-240-138',
    sourceLabel: 'Colorado Revised Statutes § 12-240-138',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'CT',
    status: 'EXCEPTIONS',
    summary:
      'Connecticut recognizes a corporate practice of medicine doctrine, but its med spa law lets a spa employ or contract with a physician, physician assistant, or APRN. Non-physician ownership of a med spa is generally possible, though the setup matters and medical decisions must stay with the licensed provider.',
    citation:
      "Conn. Gen. Stat. §§ 20-9, 19a-903c, 33-182aa et seq.; Conn. Att'y Gen. Op. No. 248 (1954)",
    sourceUrl: 'https://www.cga.ct.gov/2025/rpt/pdf/2025-R-0159.pdf',
    sourceLabel: 'Connecticut Office of Legislative Research: Medical Spas (2025)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'DE',
    status: 'PERMISSIVE',
    summary:
      'Delaware does not have a clear corporate practice of medicine prohibition. Non-physicians can generally own a clinic or med spa and hire or contract a Medical Director, although a professional corporation must be owned by licensed professionals.',
    citation:
      'Del. Code Ann. tit. 24, ch. 17 (Medical Practice Act); Del. Code Ann. tit. 8, ch. 6 (professional service corporations)',
    sourceUrl:
      'https://ndlegis.gov/assembly/68-2023/testimony/HHUMSER-2148-20230308-22757-F-KOEBELE_COURTNEY.pdf',
    sourceLabel: 'State CPOM Doctrines survey (N.D. Legislature testimony, 2023)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'DC',
    status: 'EXCEPTIONS',
    summary:
      "D.C. has no statute that clearly bans the corporate practice of medicine, but court rulings and Board of Medicine guidance favor physician control. The Board's med spa policy describes a med spa as physician owned or majority physician owned, so owners often use a physician-owned entity with a management company.",
    citation:
      "D.C. Code § 3-1201.02; D.C. Bd. of Med. Policy No. 15-02 (Nov. 13, 2014); Group Health Ass'n v. Moor (D.D.C. 1938)",
    sourceUrl: 'https://dchealth.dc.gov/publication/policy-practice-aesthetic-medicine',
    sourceLabel: 'DC Board of Medicine: Policy on the Practice of Aesthetic Medicine',
    lastReviewed: REVIEWED,
    confidence: 'LOW',
  },
  {
    state: 'FL',
    status: 'PERMISSIVE',
    summary:
      'Florida does not prohibit the corporate practice of medicine. Non-physicians can generally own a med spa or clinic and employ a physician, but a clinic not owned by licensed practitioners may need a state health care clinic license and a designated medical director.',
    citation:
      'Fla. Stat. §§ 400.9905, 400.9935 (Health Care Clinic Act); Rush v. City of St. Petersburg, 205 So. 2d 11 (Fla. 2d DCA 1967)',
    sourceUrl: 'https://www.flsenate.gov/Laws/Statutes/2025/400.9905',
    sourceLabel: 'Florida Statutes § 400.9905 (Health Care Clinic Act definitions)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'GA',
    status: 'EXCEPTIONS',
    summary:
      'Georgia repealed its corporate practice of medicine statute in 1982, and the doctrine is rarely enforced today. Non-physicians can generally own a med spa if the structure keeps all medical decisions with the physician, though professional corporations must still be owned by licensed professionals.',
    citation:
      'Health Horizons, Inc. v. State Farm, 521 S.E.2d 383 (Ga. Ct. App. 1999); former O.C.G.A. § 43-34-37 (repealed 1982)',
    sourceUrl: 'https://caselaw.findlaw.com/court/ga-court-of-appeals/1335847.html',
    sourceLabel: 'Health Horizons v. State Farm (Ga. Ct. App. 1999)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'HI',
    status: 'PERMISSIVE',
    summary:
      'Hawaii does not appear to have a statute or court decision banning the corporate practice of medicine. Non-physicians can generally own a clinic and hire or contract a physician, but official guidance is limited, so a local legal review is a good idea.',
    citation:
      'Haw. Rev. Stat. § 453-2 (licensure); Haw. Rev. Stat. ch. 415A (professional corporations)',
    sourceUrl:
      'https://ndlegis.gov/assembly/68-2023/testimony/HHUMSER-2148-20230308-22757-F-KOEBELE_COURTNEY.pdf',
    sourceLabel: 'State CPOM Doctrines survey (N.D. Legislature testimony, 2023)',
    lastReviewed: REVIEWED,
    confidence: 'LOW',
  },
  {
    state: 'ID',
    status: 'PERMISSIVE',
    summary:
      "Idaho's Board of Medicine formally rejected the corporate practice of medicine doctrine in 2016. Non-physicians can generally own a med spa or clinic and employ or contract a physician, who must keep control of medical decisions.",
    citation:
      'Idaho State Bd. of Medicine, Telephone Conference Minutes (Mar. 28, 2016); Worton v. Davis, 73 Idaho 217 (1952)',
    sourceUrl: 'https://www.hollandhart.com/pdf/BOM%202016-03.pdf',
    sourceLabel: 'Idaho State Board of Medicine minutes, March 28, 2016',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'IL',
    status: 'STRICT',
    summary:
      'Illinois prohibits the corporate practice of medicine, with an exception for licensed hospitals. A non-physician generally cannot own a med spa or clinic that employs physicians, so owners typically use a physician-owned medical corporation or PLLC paired with a separate management company.',
    citation:
      'Berlin v. Sarah Bush Lincoln Health Ctr., 179 Ill. 2d 1, 688 N.E.2d 106 (1997); People ex rel. Kerner v. United Med. Serv., 362 Ill. 442 (1936)',
    sourceUrl: 'https://caselaw.findlaw.com/court/il-supreme-court/1200484.html',
    sourceLabel: 'Berlin v. Sarah Bush Lincoln (Ill. Sup. Ct.)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'IN',
    status: 'EXCEPTIONS',
    summary:
      'Indiana recognizes the corporate practice of medicine doctrine, but hospitals and certain health care organizations owned by licensed providers, including nurses, may employ physicians if they do not control medical judgment. Whether a non-physician owner can employ a Medical Director directly depends on how the business is owned and set up.',
    citation:
      'Ind. Code § 25-22.5-1-2(a)(21)-(22), (c); Iterman v. Baker, 15 N.E.2d 365 (Ind. 1938)',
    sourceUrl:
      'https://codes.findlaw.com/in/title-25-professions-and-occupations/in-code-sect-25-22-5-1-2.html',
    sourceLabel: 'Indiana Code § 25-22.5-1-2',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'IA',
    status: 'EXCEPTIONS',
    summary:
      'Iowa has no statute banning the corporate practice of medicine, and an Iowa Attorney General opinion looks at each arrangement case by case. A business may generally work with physicians as long as the physician keeps control over medical decisions, but the law is not fully settled, so how the practice is set up matters.',
    citation:
      "Iowa Att'y Gen. Op. No. 91-7-1 (1992), republished by the Iowa Board of Medicine (Aug. 1, 2015); Iowa Code § 147.2",
    sourceUrl:
      'https://ndlegis.gov/assembly/68-2023/testimony/SHUMSER-2148-20230124-15731-F-KOEBELE_COURTNEY.pdf',
    sourceLabel: 'State CPOM survey (ND Legislature record)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'KS',
    status: 'STRICT',
    summary:
      'Kansas strictly prohibits the corporate practice of medicine, with exceptions mainly for hospitals and a few narrow statutory categories. A non-physician generally cannot own a clinic that provides medical services, so owners typically use a physician-owned professional corporation with a separate management company.',
    citation:
      "Early Detection Ctr., Inc. v. Wilson, 248 Kan. 869, 811 P.2d 860 (1991); St. Francis Reg'l Med. Ctr. v. Weiss, 254 Kan. 728, 869 P.2d 606 (1994); K.S.A. 65-28,134",
    sourceUrl: 'https://case-law.vlex.com/vid/early-detection-center-inc-889002966',
    sourceLabel: 'Early Detection Center v. Wilson (Kan. 1991)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'KY',
    status: 'EXCEPTIONS',
    summary:
      "Kentucky's corporate practice of medicine rule comes from older court cases, but the state medical board has said it generally will not act as long as the employer does not interfere with the physician's independent judgment. Non-physician owners can often contract with a Medical Director, though the law is not fully settled.",
    citation:
      'Kendall v. Beiling, 175 S.W.2d 489 (Ky. 1943); Ky. Bd. of Med. Licensure Op. No. 36 (Feb. 10, 1995); KRS 311.560; KRS 216.940',
    sourceUrl:
      'https://ndlegis.gov/assembly/68-2023/testimony/SHUMSER-2148-20230124-15731-F-KOEBELE_COURTNEY.pdf',
    sourceLabel: 'State CPOM survey (ND Legislature record)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'LA',
    status: 'PERMISSIVE',
    summary:
      "Louisiana's medical board says a business corporation may employ a physician as long as it does not interfere with the physician's medical judgment. Non-physician owners can generally hire or contract a Medical Director, but clinical decisions must stay with the physician.",
    citation:
      "La. State Bd. of Med. Exam'rs, Statement of Position: Corporate Practice of Medicine (Update, Dec. 2024); La. R.S. 37:1261-1292",
    sourceUrl:
      'https://a.storyblok.com/f/150540/x/b9d7227069/corporate-practice-of-medicine-sop-dec-2024-v2.pdf',
    sourceLabel: 'LSBME Statement of Position (Dec 2024)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'ME',
    status: 'PERMISSIVE',
    summary:
      'Maine has no meaningful corporate practice of medicine prohibition. Non-physicians can generally own a clinic and employ or contract a Medical Director, while each physician stays personally responsible for clinical decisions.',
    citation: 'Me. Bd. of Licensure in Medicine, Advisory Opinion (Nov. 2, 1992)',
    sourceUrl:
      'https://ndlegis.gov/assembly/68-2023/testimony/SHUMSER-2148-20230124-15731-F-KOEBELE_COURTNEY.pdf',
    sourceLabel: 'State CPOM survey (ND Legislature record)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MD',
    status: 'EXCEPTIONS',
    summary:
      'Maryland has no statute on the corporate practice of medicine, but regulators have long taken the view that physicians should generally be employed only by physician-owned entities, hospitals, or HMOs. Because the rule is unclear and inconsistently applied, many non-physician owners use a physician-owned practice with a separate management company.',
    citation:
      'Common law doctrine; Md. Code Ann., Health Occ. § 14-302 (licensure exceptions); Md. Code Ann., Health-Gen. § 19-351 (hospitals)',
    sourceUrl:
      'https://www.gfrlaw.com/what-we-do/insights/time-reform-corporate-practice-medicine-doctrine',
    sourceLabel: 'Gordon Feinblatt: Maryland CPOM doctrine',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MA',
    status: 'STRICT',
    summary:
      'Massachusetts prohibits the corporate practice of medicine. Physicians may generally practice only through physician-owned entities, nonprofits, or licensed health care facilities, so med spa owners typically pair a physician-owned practice with a separate management company.',
    citation:
      '243 CMR 2.07(22); McMurdo v. Getter, 298 Mass. 363 (1937); M.G.L. c. 156A and c. 156C, § 6',
    sourceUrl: 'https://www.law.cornell.edu/regulations/massachusetts/243-CMR-2-07',
    sourceLabel: '243 CMR 2.07(22) (Board of Registration in Medicine)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MI',
    status: 'STRICT',
    summary:
      'Michigan strictly prohibits the corporate practice of medicine by for-profit businesses. A non-physician generally cannot own a medical practice, so owners typically use a physician-owned PC or PLLC with a separate management company.',
    citation:
      "MCL 450.1251 (Business Corporation Act, learned professions); Mich. Att'y Gen. Op. No. 6592 (1989); Mich. Att'y Gen. Op. No. 6770 (1993)",
    sourceUrl:
      'https://higherlogicdownload.s3.amazonaws.com/MICHBAR/f8a8a213-d7d6-49c4-bdff-e6c7a728e471/UploadedImages/pdfs/CorporatePractice.pdf',
    sourceLabel: 'State Bar of Michigan: CPOM in Michigan',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MN',
    status: 'STRICT',
    summary:
      'Minnesota courts recognize the corporate practice of medicine doctrine, with exceptions for nonprofits and hospitals. A for-profit business owned by non-physicians generally cannot employ physicians, so owners typically use a physician-owned professional firm with a separate management company.',
    citation:
      'Isles Wellness, Inc. v. Progressive N. Ins. Co., 703 N.W.2d 513 (Minn. 2005); Granger v. Adson, 190 Minn. 23, 250 N.W. 722 (1933); Minn. Stat. ch. 319B (Professional Firms Act)',
    sourceUrl: 'https://case-law.vlex.com/vid/isles-wellness-inc-v-891823175',
    sourceLabel: 'Isles Wellness v. Progressive (Minn. 2005)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'MS',
    status: 'PERMISSIVE',
    summary:
      "Mississippi's medical board does not restrict the business form a physician works in, as long as the physician keeps full control over treatment decisions and patient billing. Non-physician owners can generally hire or contract a Medical Director.",
    citation:
      'Miss. State Bd. of Med. Licensure, Board Policy 3.02, Corporate Practice of Medicine (compilation as last revised Dec. 2025)',
    sourceUrl:
      'https://www.msbml.ms.gov/sites/default/files/2026%20Law%20Documents/MSBML_Board_Policies.pdf',
    sourceLabel: 'MSBML Board Policy 3.02',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'MO',
    status: 'PERMISSIVE',
    summary:
      'Missouri does not have a corporate practice of medicine doctrine. Non-physician owners can generally hire or contract a Medical Director, though supervision and collaborative practice rules still apply.',
    citation:
      'State ex inf. McKittrick v. Gate City Optical Co., 97 S.W.2d 89 (Mo. 1936); State ex inf. Sager v. Lewin, 106 S.W. 581 (Mo. Ct. App. 1907)',
    sourceUrl:
      'https://www.martinpringle.com/news/view/no-corporate-practice-of-medicine-doctrine-in-missouri-certain-licensed-healthcare-professionals-can-form-professional-corporations',
    sourceLabel: 'Martin Pringle: No CPOM doctrine in Missouri',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'MT',
    status: 'EXCEPTIONS',
    summary:
      'Montana repealed its corporate practice statute, but Medical Board rules still generally bar physicians from working for an unlicensed owner. Physicians may work through a professional entity or with a licensed health care facility or provider under a written agreement protecting their independent judgment, so the right structure depends on who owns the clinic.',
    citation:
      'Admin. R. Mont. 24.156.405(2)(m) (Board of Medical Examiners, unprofessional conduct)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/montana/Mont-Admin-r-24.156.405',
    sourceLabel: 'Montana Board of Medical Examiners rule 24.156.405',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NE',
    status: 'PERMISSIVE',
    summary:
      'Nebraska does not have a meaningful corporate practice of medicine prohibition. A non-physician can generally own a clinic and employ or contract with a Medical Director, though supervision and scope of practice rules still apply.',
    citation: 'State Electro-Medical Institute v. State, 74 Neb. 40, 103 N.W. 1078 (1905)',
    sourceUrl:
      'https://www.permithealth.com/post/nebraska-corporate-practice-of-medicine-cpom-guide',
    sourceLabel: 'Permit Health: Nebraska CPOM guide',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NV',
    status: 'STRICT',
    summary:
      'Nevada generally prohibits the corporate practice of medicine, and the state medical board is considered relatively active in enforcing it. A non-physician typically cannot own a medical practice or employ a physician, so med spa owners usually pair a physician-owned professional corporation with a separate management company.',
    citation:
      "Nev. Att'y Gen. Op. Nos. 219 (1977), 2002-10 (Feb. 26, 2002), 2010-04; NRS ch. 89 (Professional Entities)",
    sourceUrl: 'https://www.hollandhart.com/pdf/HC-nevada-webinar-1-26-21.pdf',
    sourceLabel: 'Holland & Hart: Nevada corporate practice of medicine',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NH',
    status: 'PERMISSIVE',
    summary:
      'New Hampshire does not have an explicit corporate practice of medicine prohibition. A non-physician can generally own a clinic and employ or contract with a Medical Director, though supervision and scope of practice rules still apply.',
    citation:
      'No CPOM prohibition in N.H. RSA ch. 329 (Medical Practice Act); see McLane Middleton (2025)',
    sourceUrl:
      'https://www.mclane.com/insights/know-the-law-in-nh-and-mass-can-corporations-be-doctors-too/',
    sourceLabel: 'McLane Middleton: Can corporations be doctors in NH?',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'NJ',
    status: 'STRICT',
    summary:
      'New Jersey prohibits the corporate practice of medicine through Board of Medical Examiners rules. Outside of licensed facilities like hospitals and ambulatory care centers, a general business corporation generally cannot employ physicians, so owners typically use a physician-owned practice with a separate management company.',
    citation:
      'N.J.A.C. 13:35-6.16(f); Allstate Ins. Co. v. Northfield Med. Ctr., P.C., 228 N.J. 596 (2017)',
    sourceUrl: 'https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-13-35-6-16',
    sourceLabel: 'N.J.A.C. 13:35-6.16 (Professional practice structure)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'NM',
    status: 'PERMISSIVE',
    summary:
      'New Mexico does not prohibit the corporate practice of medicine. A business entity can generally provide medical services as long as those services are delivered by or under the direction of licensed physicians, so a non-physician can typically own a clinic and engage a Medical Director.',
    citation: '16.10.1.13 NMAC (Business entities authorization to provide healthcare services)',
    sourceUrl: 'https://www.srca.nm.gov/parts/title16/16.010.0001.html',
    sourceLabel: '16.10.1.13 NMAC (NM Medical Board rule)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'NY',
    status: 'STRICT',
    summary:
      'New York strictly prohibits the corporate practice of medicine. A business corporation or non-physician generally cannot own a medical practice or employ physicians, so med spa owners typically use a physician-owned professional corporation or PLLC with a separate management company.',
    citation:
      'N.Y. Educ. Law 6512; N.Y. Bus. Corp. Law 1503, 1507; NYSED Office of the Professions guidance',
    sourceUrl: 'https://www.op.nysed.gov/corporate/corporate-practice-professions',
    sourceLabel: 'NYSED Office of the Professions: Corporate Practice',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'NC',
    status: 'STRICT',
    summary:
      'North Carolina prohibits the corporate practice of medicine, and the Medical Board expects medical practices to be owned entirely by appropriately licensed clinicians. A non-physician generally cannot own a med spa that provides medical services, so owners typically use a physician-owned professional entity with a separate management company.',
    citation:
      'N.C. Medical Board Position Statement 10.1.2, Corporate Practice of Medicine (adopted 2016, amended Sept. 2025); N.C. Gen. Stat. ch. 55B',
    sourceUrl:
      'https://www.ncmedboard.org/resources-information/professional-resources/laws-rules-position-statements/position-statements/corporate-practice-of-medicine',
    sourceLabel: 'NC Medical Board: Corporate Practice of Medicine',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'ND',
    status: 'STRICT',
    summary:
      'North Dakota generally treats the corporate practice of medicine as prohibited, with exceptions mainly for hospitals and nonprofit entities. A for-profit business owned by non-physicians typically should not employ physicians directly, so owners usually use a physician-owned professional entity with a separate management company.',
    citation:
      "N.D. Att'y Gen. Advisory Letter to Robert G. Hoy (Oct. 23, 1990); N.D. Cent. Code 43-17-42",
    sourceUrl:
      'https://www.library.nd.gov/statedocs/AttorneyGeneral/AdvisoryLetters/1990/102390-Hoy.pdf',
    sourceLabel: 'ND Attorney General letter on corporate practice (1990)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'OH',
    status: 'PERMISSIVE',
    summary:
      "Ohio does not prohibit the corporate practice of medicine. Physicians may generally be employed by or contract with any type of business entity, so a non-physician can typically own a clinic and engage a Medical Director, as long as the business does not control the physician's clinical judgment.",
    citation:
      'Ohio Rev. Code 4731.226; State Medical Board of Ohio Statement on the Corporate Practice of Medicine (Mar. 15, 2012)',
    sourceUrl:
      'https://dam.assets.ohio.gov/image/upload/med.ohio.gov/portals/0/laws%20_%20rules/position%20statements/corporate%20practice%20of%20medicine%20statement%20march%202012.pdf',
    sourceLabel: 'State Medical Board of Ohio statement on corporate practice',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'OK',
    status: 'PERMISSIVE',
    summary:
      'Oklahoma generally does not prohibit the corporate practice of medicine for physicians. A non-physician can typically own a clinic and employ or contract with a Medical Director, though fee-splitting, supervision, and scope of practice rules still apply.',
    citation:
      "Okla. Att'y Gen. Op. No. 02-20 (May 8, 2002); 59 O.S. 492 (hospital employment of physicians)",
    sourceUrl:
      'https://www.mcafeetaft.com/the-nonexistent-corporate-practice-of-medicine-prohibition-in-oklahoma/',
    sourceLabel: 'McAfee & Taft: Oklahoma CPOM',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'OR',
    status: 'STRICT',
    summary:
      'Oregon strictly prohibits the corporate practice of medicine and in 2025 passed one of the toughest laws in the country limiting how management companies can control medical practices. Medical practices that use physicians generally must be majority owned and controlled by Oregon-licensed physicians, so med spa owners should get legal advice before setting up a management company structure.',
    citation:
      'ORS 58.375; Oregon SB 951 (2025), as amended by HB 3410 (2025); State ex rel. Sisemore v. Standard Optical Co., 182 Or. 452 (1947)',
    sourceUrl:
      'https://www.hklaw.com/en/insights/publications/2026/05/an-update-on-the-implementation-and-implications-of-oregons',
    sourceLabel: 'Holland & Knight: Oregon CPOM law update (2026)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'PA',
    status: 'STRICT',
    summary:
      'Pennsylvania generally follows the corporate practice of medicine doctrine based on long-standing court decisions. A non-physician business typically should not own a practice or employ physicians to provide medical care, so med spa owners usually use a physician-owned professional entity paired with a management company.',
    citation:
      'Neill v. Gimbel Bros., Inc., 330 Pa. 213, 199 A. 178 (1938); Pennsylvania Medical Practice Act of 1985',
    sourceUrl:
      'https://www.lambmcerlane.com/articles/the-corporate-practice-of-medicine-is-it-applicable-your-client/',
    sourceLabel: 'Lamb McErlane: Pennsylvania corporate practice of medicine',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'RI',
    status: 'STRICT',
    summary:
      'Rhode Island generally does not allow business corporations to provide medical services, so a non-physician typically cannot own the medical side of a med spa. Owners usually work with a physician-owned professional entity and a separate management company.',
    citation:
      'R.I. Gen. Laws § 7-1.2-301; R.I. Gen. Laws ch. 7-5.1 (Professional Service Corporations)',
    sourceUrl:
      'https://codes.findlaw.com/ri/title-7-corporations-associations-and-partnerships/ri-gen-laws-sect-7-1-2-301/',
    sourceLabel: 'R.I. Gen. Laws § 7-1.2-301',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'SC',
    status: 'EXCEPTIONS',
    summary:
      "South Carolina courts recognize a corporate practice of medicine rule, but the medical board mainly focuses on keeping the physician's medical judgment independent. In practice, non-physicians often own med spas and clinics and contract with a Medical Director, but the setup should keep all medical decisions with the physician.",
    citation:
      'Baird v. Charleston County, 511 S.E.2d 69 (S.C. 1999); S.C. Board of Medical Examiners advisory opinion on corporate practice of medicine (Nov. 21, 2022)',
    sourceUrl: 'https://dc.statelibrary.sc.gov/items/06df5f16-fe93-4c0c-b0f3-b93a370716fe',
    sourceLabel: 'SC Board of Medical Examiners CPOM advisory opinion',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'SD',
    status: 'EXCEPTIONS',
    summary:
      "South Dakota bars corporations from practicing medicine but allows them to employ physicians when the arrangement protects the physician's independent judgment and meets other conditions. A clinic owned by a non-physician can often hire a Medical Director, but the contract terms matter.",
    citation: 'S.D. Codified Laws § 36-4-8.1',
    sourceUrl: 'https://sdlegislature.gov/api/Statutes/36-4-8.1.html',
    sourceLabel: 'SDCL § 36-4-8.1',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'TN',
    status: 'STRICT',
    summary:
      'Tennessee generally prohibits the corporate practice of medicine, with exceptions mainly for hospitals and certain other facilities. A non-physician typically cannot own the medical side of a med spa, so owners usually pair a physician-owned practice with a separate management company.',
    citation:
      'Tenn. Code Ann. § 63-6-204; Tenn. Comp. R. & Regs. 0880-02-.24 (medical spa registration)',
    sourceUrl:
      'https://codes.findlaw.com/tn/title-63-professions-of-the-healing-arts/tn-code-sect-63-6-204/',
    sourceLabel: 'Tenn. Code § 63-6-204',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'TX',
    status: 'STRICT',
    summary:
      'Texas strictly prohibits the corporate practice of medicine. A non-physician generally cannot own a med spa or clinic that provides medical services, so owners typically pair a physician-owned practice with a separate management company.',
    citation:
      'Tex. Occ. Code §§ 155.001, 164.052, 165.156; Tex. Occ. Code § 162.001 (nonprofit health organization exception)',
    sourceUrl:
      'https://www.tmb.texas.gov/apply-renew/other-permits-and-licenses/non-profit-health-organizations-license-application',
    sourceLabel: 'Texas Medical Board',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'UT',
    status: 'PERMISSIVE',
    summary:
      'Utah does not prohibit the corporate practice of medicine. Non-physicians and business corporations can generally own a med spa or clinic and employ or contract with a physician, as long as only licensed providers practice medicine.',
    citation: 'Utah Code Ann. § 58-67-802 (form of practice)',
    sourceUrl:
      'https://codes.findlaw.com/ut/title-58-occupations-and-professions/ut-code-sect-58-67-802/',
    sourceLabel: 'Utah Code § 58-67-802',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'VT',
    status: 'PERMISSIVE',
    summary:
      'Vermont does not have a general ban on the corporate practice of medicine, so non-physicians can generally own a med spa or clinic and contract with a Medical Director. A 2026 law adds limits on private equity and hedge fund control over clinical decisions.',
    citation:
      'No CPOM statute or case law; 2026 Vt. Acts No. 133 (H.583), 18 V.S.A. §§ 9771 to 9774',
    sourceUrl: 'https://legislature.vermont.gov/bill/status/2026/H.583',
    sourceLabel: 'Vermont H.583 (Act 133 of 2026)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'VA',
    status: 'PERMISSIVE',
    summary:
      'Virginia law allows general business corporations to employ or contract with licensed physicians to provide medical services. Non-physicians can generally own a med spa or clinic and hire a Medical Director, as long as the physician keeps control over medical decisions.',
    citation: 'Va. Code §§ 54.1-111(F), 13.1-542.1',
    sourceUrl: 'https://law.lis.virginia.gov/vacode/title54.1/chapter1/section54.1-111/',
    sourceLabel: 'Va. Code § 54.1-111',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'WA',
    status: 'STRICT',
    summary:
      'Washington follows the corporate practice of medicine doctrine, so a business owned by people without a health care license generally cannot employ physicians. Med spas typically use a professional corporation or PLLC owned by licensed health care professionals, often paired with a separate management company.',
    citation:
      'Columbia Physical Therapy, Inc. v. Benton Franklin Orthopedic Assocs., 168 Wn.2d 421, 228 P.3d 1260 (2010); RCW 18.100.050',
    sourceUrl: 'https://caselaw.findlaw.com/court/wa-supreme-court/1522738.html',
    sourceLabel: 'Columbia Physical Therapy v. Benton Franklin (Wash. 2010)',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'WV',
    status: 'STRICT',
    summary:
      'West Virginia prohibits the corporate practice of medicine, and medical corporations must be fully owned by licensed physicians or podiatrists. A non-physician typically cannot own the medical side of a med spa, so owners usually pair a physician-owned practice with a separate management company.',
    citation:
      'W. Va. Code § 30-3-15; WV Board of Medicine Position Statement on the Corporate Practice of Medicine (re-adopted Mar. 19, 2018)',
    sourceUrl: 'https://wvbom.wv.gov/download_resource.asp?id=501',
    sourceLabel: 'WV Board of Medicine CPOM position statement',
    lastReviewed: REVIEWED,
    confidence: 'HIGH',
  },
  {
    state: 'WI',
    status: 'EXCEPTIONS',
    summary:
      'Wisconsin restricts the corporate practice of medicine mainly through Attorney General opinions, and enforcement has been limited. A practice owned by physicians or other licensed professionals is typically the safest structure, often with a separate management company.',
    citation: "Wis. Stat. ch. 448; 75 Op. Att'y Gen. 200 (1986); Wis. Att'y Gen. Op. 39-86",
    sourceUrl:
      'https://www.wilaw.com/ochdl-health-law-advisor-corporate-practice-of-medicine-and-fee-splitting-considerations-for-telehealth-ventures/',
    sourceLabel: "O'Neil Cannon: Wisconsin CPOM overview",
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
  {
    state: 'WY',
    status: 'PERMISSIVE',
    summary:
      'Wyoming does not have a meaningful corporate practice of medicine prohibition. Non-physicians can generally own a med spa or clinic and employ or contract with a physician as Medical Director.',
    citation: "Wyo. Stat. §§ 17-3-101 to 17-3-104; Wyo. Att'y Gen. Op. No. 79-17 (1979)",
    sourceUrl:
      'https://ndlegis.gov/assembly/67-2021/testimony/SHUMSER-2128-20210125-3125-F-TRAYNOR_PAT.pdf',
    sourceLabel: '50-state CPOM survey (N.D. Legislature testimony, 2021)',
    lastReviewed: REVIEWED,
    confidence: 'MEDIUM',
  },
]

const RULES_BY_STATE = new Map(CORPORATE_PRACTICE_RULES.map((rule) => [rule.state, rule]))

/** The reviewed CPOM entry for a state code (case-insensitive), or null. */
export function getCorporatePracticeRule(stateCode: string): CorporatePracticeRule | null {
  return RULES_BY_STATE.get(stateCode.trim().toUpperCase()) ?? null
}
