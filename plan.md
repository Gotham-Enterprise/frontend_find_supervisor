# Medical Director Feature Set — Implementation Documentation

Branch: `as/fas-enhacements` in ALL THREE repos (uncommitted as of 2026-08-19):

- Frontend: `~/Projects/frontend_find_supervisor_next`
- Backend: `~/Projects/backend_job_finder`
- Admin: `~/Projects/frontend_job_finder_admin`

## Overview

The signup selector grew from 2 to 4 choices — **I'm a Supervisor · I'm a Supervisee ·
I'm a Medical Director · I need a Medical Director** — and Medical Director became a
separated product across signup, profile edit, search, and the dashboard.

---

## 1. "I'm a Medical Director" signup

- `SupervisorSignupForm` gained `variant: 'supervisor' | 'medical-director'`
  (`key={role}` remount in `SignupCard` is load-bearing). Form typed as superset
  `MedicalDirectorFormValues`.
- Step 2 (`MedicalDirectorStepLicenseCredentials.tsx`): NO Supervisor Type select —
  `supervisorType: 'Medical Director'` preset; occupation options come from the
  hierarchy (now a SINGLE occupation: **"Medical Doctor"**); degree type MD/DO;
  license entries via shared `LicenseEntriesField` (gained a `name` prop for nested
  paths); NPI/years/license doc single (person-level).
- **Board Certification** ("Board Certified?" Switch, default No): field array
  (`BoardCertificationEntriesField`) — Certifying Board (24 ABMS boards + "Other"
  free text; list in `src/lib/utils/board-certification.ts`), Specialty (physician
  specialties), **required** Certification Number + Expiration Date (no past
  dates; enforced FE zod/RHF rules, BE validator+service, admin edit),
  optional Subspecialty.
- **Additional Physician Offerings**: checkboxes for Supervising/Collaborating
  Physician; each checked one shows a full credentials block
  (`OfferingCredentialsFields`: occupation/specialty/degree + own license entries).
- Step 3: **Patient Population only renders/validates when an offering is checked**
  (plain MD skips it); fee locked to MONTHLY (pre-existing rule); Accepting
  Supervisees retained as-is.
- "Medical Director" was REMOVED from the regular supervisor flow's type dropdown.
- Payload additions: `offerings` + `boardCertifications` JSON fields
  (`buildOfferingsPayload` / `buildBoardCertificationsPayload` in `src/lib/api/signup.ts`).

## 2. "I need a Medical Director" signup

- `SuperviseeSignupForm` gained `variant: 'supervisee' | 'need-medical-director'`.
- Dedicated variant hides the supervision-type select and MD checkbox
  (`needsMedicalDirector` preset true → payload sends
  `typeOfSupervisorNeeded[]=Medical Director` via the existing builder).
- Occupation dropdown UNFILTERED in this variant (open beyond the supervisee
  allowlist — MD clients are med spa owners/RNs/etc.). `title` + `licensureState`
  still required.
- Optional "Preferred Occupation/Specialty" selects reuse
  `supervisorOccupationId`/`supervisorSpecialtyId`, sourced from the MD hierarchy.
- **Fee Type locked to Monthly** (Medical Directors are monthly-only): default
  `feeType: 'monthly'`, select disabled/filtered, safety effect forces the value.
- URL: `/signup?type=need-medical-director`. Regular supervisee flow keeps its
  combinable checkbox + allowlist.

## 3. Backend data model & endpoints

New Prisma models (`prisma/schema/supervisor.prisma`), hand-written migrations
(relationMode="prisma": NO FKs, apply via `prisma db execute`, NEVER `migrate dev`):

| Migration                                                     | What                                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| `20260818000000_add_supervisor_offerings`                     | `SupervisorOffering` + `SupervisorOfferingLicense` tables       |
| `20260818000001_rename_medical_director_occupations`          | MD/DO → "Medical Doctor"/"Physician" (+ profile remap)          |
| `20260819000000_add_supervisor_board_certifications`          | `SupervisorBoardCertification` table                            |
| `20260819100000_remove_medical_director_physician_occupation` | Removed "Physician" — MD keeps ONE occupation                   |
| `20260820000000_add_district_of_columbia`                     | DC + Washington city (manual max-id+1 inserts)                  |
| `20260821000000_add_supervisee_md_preferences`                | md\* preference + `introduction` columns on `SuperviseeProfile` |

All idempotent. Deploy to other envs with ONE command (after deploying code):
`node scripts/apply_medical_director_release.js` — executes the six
migrations' SQL in order, runs `prisma/seed-supervisor-type.js`, and verifies
(tables, 7 SuperviseeProfile columns, DC, single MD occupation). Safe to
re-run. (`prisma generate` happens during the normal build.) Manual
fallback: `npx prisma db execute --file <migration> --schema prisma/schema`
in order, then the seeder.

- **Register** (`POST /supervision/supervisor/register`): accepts `offerings`
  (1–2, MD-only, occupation validated against hierarchy) and `boardCertifications`
  (1–10, MD-only); nested create in one transaction; `patientPopulation` optional
  ONLY for a plain MD (no offerings).
- **Update** (`PUT /supervision/supervisor/profile` + admin variant, which
  delegates to the same service): accepts both fields with FULL-REPLACE semantics
  (empty array clears rows, absent = untouched); **blocks supervisorType changes
  into/out of Medical Director**.
- **Responses**: `offerings` + `boardCertifications` included in register response,
  getMe, profile detail (license/cert numbers redacted for non-owners), public
  profile (numbers never selected), search cards (`transformSupervisor`), admin detail.
- **Search** (`GET /supervision/search`): type filter is
  `primary type IN list OR offerings.some IN list` — an MD offering "Supervising
  Physician" appears for PAs. New `searchMode` param:
  - `supervisors`: primary MDs excluded (offering matches stay)
  - `medicalDirectors`: primary MDs only; empty page if the supervisee lacks the MD need
  - absent: legacy mixed behavior (public/pSEO callers untouched)
- **Recommended** (`GET /supervision/recommended-supervisors`): same `mode` param.
- Recommendation emails + best-match scoring are offerings-aware.

## 4. Profile edit (user + admin)

- Supervisor Type LOCKED for MD profiles (disabled + note); "Medical Director"
  filtered out of the dropdown for everyone else. Backend enforces too.
- Board Certification + Offerings sections added to both edit UIs:
  - User: `SupervisorProfileEditFields.tsx` reusing the signup components
    (matching field names; shared components use `useFormContext` casts).
  - Admin: new `EditSupervisorMedicalDirectorFields.tsx` (useState-based).
- Patient Population hidden in both edit UIs for a plain MD (validation matches).
- Generic Certifications field hidden for MD profiles (Board Certification replaces it).

## 5. Display & search separation (supervisee-facing)

- Shared helpers `getSupervisorTypeDisplayLabels`/`formatSupervisorTypeWithOfferings`
  (`src/lib/utils/profile-formatters.ts`).
- Dashboard My Profile subline + search card labels show ALL roles on every
  page ("Medical Director · Supervising Physician") — the earlier
  offering-role-only label in supervisors mode was REVERSED per user
  (2026-08-21).
- `/find-supervisors/[id]` detail: one badge per role in the hero; License &
  Credentials section shows Board Certifications rows and "Offered as X" rows
  (credentials + per-license lines).
- New **`/find-medical-directors`** page (reuses `SearchSupervisorPage` with
  `mode='medical-directors'`): MD-only results; filters trimmed (NO Occupation,
  License Type, Patient Population; Specialty lists physician specialties directly).
- Sidebar links gated by `typeOfSupervisorNeeded` (legacy empty-needs profiles keep
  Find Supervisors); cross-redirects between the two find pages.
- Supervisee dashboard: separate "Recommended Supervisors" and "Recommended
  Medical Directors" cards (per needs; `useRecommendedSupervisors` mode param).
- Hire CTA/modal ("Hire as Supervisor" vs "Hire as Medical Director") is
  driven by the ROUTE the supervisee came from, not the primary type
  (2026-08-21): /find-supervisors/[id] hires "as Supervisor" even for an
  offering-MD; /find-medical-directors/[id] hires "as Medical Director"; a
  plain MD with no offerings is always "as Medical Director". The budget
  prefill follows the same `hireContext`. The modal's "Type of Supervision
  Needed" dropdown offers ONLY the roles that supervisor provides in that
  context (locked/disabled when there is exactly one, e.g. an offering-MD
  hired from /find-supervisors is fixed to "Supervising Physician"). In the
  MD-hire modal the Budget Type is locked to Monthly with a single "Monthly
  Budget ($)" amount (no min/max), and the copy is MD-appropriate
  ("Medical Director Preferences", "Type of Service Needed", "Goals for the
  Engagement", MD intro example).
- MD-only supervisees see "Hired Medical Directors" in the sidebar + topbar
  (labels only — `/hired-supervisors` page content wording is a noted follow-up).
- Detail-page hire CTA + modal say "Hire as Medical Director" for MD profiles.

## 6. Testing status

- Frontend: **196 vitest tests** pass; lint (0 warnings), tsc, production build clean.
- Backend script tests (node): offerings validator 15, board certs 14, profile
  update MD fields 11, patient population 5, professional credentials 14,
  supervisee md preferences validator 16, search mode integration 13 (self-cleaning; requires local DB; NOTE: requiring
  supervision_service opens Redis handles → scripts must `process.exit`;
  `acceptingSupervisees` is an unconditional equality filter — pass `true`).
- Admin: tsc + next lint + build clean (no test suite).
- Pre-existing failures (NOT from this work): backend
  `tests/supervisee_eligibility.test.js` 4 failures (present on clean HEAD
  82c57ba2); 2 admin lint warnings in `useSupervisorLogic.ts`.

## 7. Pending / known limitations / enhancement ideas

**Agreed next work (user-confirmed, not yet built)**

- [x] **`/find-medical-directors/[id]` dedicated detail route** (DONE
      2026-08-19): `SupervisorProfilePage` gained `basePath` prop (back-link
      per base, search-state restore preserved); MD-page cards link there via
      `profileBasePath` threaded through Results→Card; guard redirects non-MD
      profiles to `/find-supervisors/[id]`. DECIDED: MD primaries opened from
      `/find-supervisors` are NOT redirected (offering-MD viewers keep their
      back link). Topbar prefix already covers the title.
- [x] **`/hired-medical-directors` separate page** (DONE 2026-08-19):
      backend `listHires` gained a `mode` param (filters on the hire's
      supervisor `supervisorProfile.supervisorType`; empty = mixed for the
      supervisor role + dashboard); `/hired-supervisors` now requests
      `mode=supervisors`, the new page `mode=medicalDirectors`;
      `HiredSupervisorsPage` gained a mode prop (MD-aware empty state/CTA);
      sidebar shows the two links per needs and the dynamic-label stopgap in
      sidebar/topbar was REMOVED (proper PAGE_TITLES entry instead).
      Dashboard hire counts still use the mixed list (unchanged, acceptable).
- [x] **Signup polish batch** (DONE 2026-08-20): (1) MD credentials placeholder
      "MD, DO"; (2) board-cert "Expiration / Valid Through" → "Expiration Date"
      and Certification Number + Expiration Date now REQUIRED (FE + BE + admin);
      (3) DC added to state options (migration above); (4) MD agreedToPost copy
      "prospective supervisees and individuals seeking a medical director";
      (5) need-MD section header "Medical Director Preferences"; (6) need-MD
      how-soon label "How Soon Do You Need a Medical Director?".
- [x] **Need-MD copy batch 2** (DONE 2026-08-20, need-MD variant only): step-2
      indicator title "Medical Director Needs & Terms"
      (`NEED_MEDICAL_DIRECTOR_SIGNUP_STEP_META`, indicator takes `variant`);
      section "Ideal Medical Director & Terms" + label "Description of Ideal
      Medical Director" (textarea placeholder removed); submit button
      "Complete Sign Up →"; agreedToPost "…a prospective medical director…".
      SKIPPED per user: conditional City/State requirement by Preferred Format.
- [x] **Grouped occupation dropdown** (DONE 2026-08-20): supervisee Occupation
      combobox now renders "Medical" (NP + PA) on top, then "Mental Health"
      (kept legacy occupations fall into "Other"). Infra:
      `ComboboxGroup`/`ComboboxGroupLabel`/`ComboboxCollection` in
      `src/components/ui/combobox.tsx`; `FormSelectField` `groups` prop
      (searchable mode, Base UI grouped items — search hides emptied groups);
      `groupSuperviseeOccupationOptions()` in supervisee-eligibility.ts.
      Applied to regular supervisee signup + supervisee profile edit; the
      need-MD variant keeps a flat list (its dropdown is unfiltered).
- [x] **Placeholder Title Case sweep** (DONE 2026-08-20): all signup
      placeholders capitalized ("Select Timeframe", "Select Occupation",
      "Enter Your NPI Number", etc.) across both account steps, supervisee
      needs/terms, supervisor/MD credentials, offerings, board certs,
      practice details, shared `LicenseEntriesField`, and the shared
      eligibility placeholder constants (also used by profile edit).
- [x] **Separate Medical Director section in the supervisee signup** (DONE
      2026-08-21): the "I need a Medical Director" checkbox moved out of
      Supervision Needs into its own "Medical Director" section (signup +
      /my-profile edit + admin EditSuperviseeModal); checking it reveals its
      own REQUIRED fields backed by new `SuperviseeProfile` columns
      (`mdPreferredOccupation`/`mdPreferredSpecialty` optional,
      `mdHowSoonLooking` + `mdLookingDate`, `mdMonthlyBudget` — migration
      `20260821000000_add_supervisee_md_preferences`). Rules: MD preferences
      ALWAYS live in md* columns (the dedicated need-MD variant now writes
      them too — its Fee Type select was replaced by a direct Monthly
      Budget); shared howSoonLooking/budgetRange*/superviseeOccupation are
      supervision-only and required ONLY when a supervision type is selected;
      MD-only signups/profiles hide the supervision-only fields (section
      retitles to "Preferences"); backend validator gates both directions
      (md* rejected without the MD need) and update clears md* when the MD
      need is dropped. Displays: dashboard My Profile shows a Medical
      Director block; HireSupervisorModal prefills MONTHLY + mdMonthlyBudget
      when hiring an MD; admin ViewDetails shows MD rows. Layout polish
      (2026-08-21): the section renders AFTER Ideal Supervisor & Terms via its
      own `SuperviseeStepMedicalDirector` component (shared Md\* field
      components reused by the dedicated variant); how-soon label shortened to
      "How Soon Needed?" (signup + /my-profile) so the grid stays aligned —
      the dedicated need-MD variant keeps its long label. Placement refined
      again: the MD section is SLOTTED between the ideal-supervisor
      description and the agreement checkboxes (ProfileTerms
      `medicalDirectorSection` prop).
- [x] **MD description + self introduction** (DONE 2026-08-21): new columns
      `mdIdealDescription` + `introduction` (same migration). Combined
      signups get a REQUIRED "Describe Your Ideal Medical Director" textarea
      in the MD section (min 20/max 500); MD-only flows (regular + dedicated)
      reuse the main description — relabeled "Description of Ideal Medical
      Director" — and the payload copies it into `mdIdealDescription`, so the
      column is always set when the MD need is on. New OPTIONAL "Introduce
      Yourself" section (max 500) after Ideal Supervisor & Terms for all
      supervisee flows. Both fields editable sa /my-profile + admin modal;
      shown on dashboard MD block + admin ViewDetails.
- [x] **Supervisee signup is now 3 steps** (DONE 2026-08-21): Step 2 was too
      crowded — Step 3 ("Introduction & Terms") now holds Introduce Yourself +
      the agreement checkboxes + the submit button. Step 2 retitled
      "Supervision Needs" ("Medical Director Needs" sa dedicated variant) and
      ends with Ideal Supervisor description + the Medical Director section.
      New `SuperviseeStepIdealDescription` component (description + MD slot);
      `SuperviseeStepProfileTerms` is now the Step 3 component (intro +
      terms, headers removed as redundant). Step schemas/fields/meta are
      3-way; error routing on submit jumps across all three steps.
- [x] **Dashboard + edit modal alignment** (DONE 2026-08-21): dashboard My
      Profile card order fixed (Supervision Needs → States of Licensure →
      Ideal Supervisor/Medical Director description → Medical Director
      block); MD description skipped when it mirrors the main description.
      /my-profile edit modal now mirrors signup: About (Ideal Supervisor /
      About Me, relabeled "Ideal Medical Director / About Me" when MD-only)
      → Medical Director section ("Describe Your Ideal Medical Director"
      shown/required in the combined case only; MD-only copies the About
      description into mdIdealDescription like signup) → Introduction
      section. Note: supervisor-
      side supervisee views (search cards, hire dialogs) show hire-snapshot
      budgets and are unaffected; MD-only profiles simply have blank
      supervision preferences there.
- [x] **Supervision-type display label** (DONE 2026-08-20): "Type of
      Supervision Needed" dropdown shows "Supervising Mental Health
      Counselors" for the seeded "Mental Health Counselors" type —
      display-only via `supervisionTypeDisplayLabel()` in
      supervisee-eligibility.ts (stored value/payload unchanged); applied in
      signup + supervisee profile edit.

**Supervisee-side audit (2026-08-21) — complete** (dashboard Introduction
added).

**Supervisor-side MD-aware supervisee views (DONE 2026-08-21):**

- Supervisee search transformer now sends `typeOfSupervisorNeeded`,
  `mdHowSoonLooking`, `mdMonthlyBudget`; cards show "Looking for:" role
  badges (display labels) and fall back to the MD timeline for MD-only
  supervisees.
- Best-match scoring: +30 when the supervisee needs a role the supervisor
  provides (primary or offering — offerings now included in the scorer's
  query); budget-fit for MD supervisors compares their fee against
  `mdMonthlyBudget` instead of the supervision range.
- Supervisee profile view (supervisor perspective): section retitles to
  "Medical Director Needs" for MD-only; needs shown as role pills; a
  Medical Director block shows MD monthly budget, how-soon, preferred
  occupation/specialty, and the Ideal Medical Director description (skipped
  when it duplicates About). About Me now shows the Introduction first with
  the ideal-supervisor/-MD description sub-labeled beneath.
- Hire requests already label the hired role via `hire.typeOfSupervisorNeeded`
  (snapshot) — no change needed.

**Supervisor portal hire-list split (DONE 2026-08-21):**

- `listHires` mode is now ROLE-AWARE: the supervisee side keeps scoping by
  the hired supervisor's primary type, while the SUPERVISOR side scopes by
  the hire's role snapshot (`typeOfSupervisorNeeded has "Medical Director"`;
  NOT-has keeps legacy/empty-snapshot hires under supervision). Integration
  test: `tests/supervision_hires_mode.test.js` (9, self-cleaning).
- "My Supervisees" now requests mode=supervisors (identical results for
  non-MD supervisors); new **/medical-director-clients** page renders
  `SuperviseesPage mode='medical-directors'` ("Medical Director Clients"
  heading + client/engagement copy + topbar title).
- Sidebar gating by the supervisor's own profile: "Medical Director Clients"
  only for primary MDs; "My Supervisees" hidden for a plain MD (no
  offerings); non-MD supervisors unchanged. Defaults preserved while the
  profile loads. Dashboard hire counts remain mixed (accepted).

**Docs pages updated for Medical Directors (2026-08-21):** `/faq` gained a
"Medical Directors" category per role (supervisor side: account differences,
offerings, MD Clients page, board certs, locked type; supervisee side:
finding/hiring an MD, sidebar gating, dual needs, monthly budget, hired page,
multi-role cards). `/verification-guide` gained a "For Medical Directors"
card (physician credentials, board certs, offerings, monthly fees) + MD notes
on the License Type and Fee fields.

**Must do before release**

- [ ] Manual QA of all four signup flows, both edit UIs, both find pages, dashboard.
- [ ] Commit all three repos (single feature branch each: `as/fas-enhacements`).
- [ ] Run `node scripts/apply_medical_director_release.js` on staging/prod
      after deploy (applies the 6 migrations + seed + verification).

**Known v1 limitations (accepted, revisit later)**

- MD with offerings stays MONTHLY-only fee profile-wide (offering-level fees not supported).
- Hire snapshot records PRIMARY credentials only, even for offering-based hires.
- Detail-page back-link always says "Back to Find Supervisors" (even from the MD page).
- Board certifications have no dashboard/card display (detail page + edit only).
- Admin ViewDetails page does not render offerings/board certs (edit modal does; data is in the response).
- "I need a Medical Director" signups still must fill credential title + licensure
  state (awkward for unlicensed business owners — relaxing needs a backend change).
- Supervisee "Accepting" filter semantics on the MD page = accepting engagements.

**Enhancement ideas**

- Filter MD search by board certification / specialty match scoring.
- Offering-level fee types (hourly for Supervising/Collaborating engagements).
- pSEO landing page specifically for hiring medical directors.
- Email/notification copy tailored to medical-director engagements.
- **Scoped query helpers on the backend** (DONE 2026-08-20):
  `medicalDirectorProfileFilter()` / `nonMedicalDirectorProfileFilter()` /
  `nonMedicalDirectorOrOfferingProfileFilter()` in `utils/supervisor-type.js`,
  used by searchSupervisors + listHires (getRecommendedSupervisors filters in
  JS via the existing `isMedicalDirectorSupervisorType`). New scoping rules
  must use these instead of ad hoc `supervisorType` comparisons. Context: user asked about a separate DB table
  for MDs — DECIDED against it (shared hire/payment/messaging machinery,
  dual-role offering-MDs, ~95% shared fields; MD-specific data already lives
  in satellite tables `SupervisorOffering`/`SupervisorBoardCertification`).
  Query-level separation is the agreed pattern.

## 8. Key architectural notes for future work

- Shared component reuse pattern: signup components are reused in profile edit by
  matching FIELD NAMES; `useFormContext<MedicalDirectorFormValues>()` casts are
  intentional (RHF context generics are unchecked).
- `key={role}` on both signup form variants prevents stale `useForm` state.
- Full-replace semantics for offerings/board certs on update: send `[]` to clear,
  omit to leave untouched.
- `searchMode`/`mode` params are OPT-IN so public pSEO pages keep legacy behavior.
- Medical Director product decisions live in `~/.claude` memory
  (`medical-director-signup-status.md`) with the full decision log.
