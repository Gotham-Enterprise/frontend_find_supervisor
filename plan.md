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
  specialties), optional subspecialty/cert number/expiration (no past dates).
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
- URL: `/signup?type=need-medical-director`. Regular supervisee flow keeps its
  combinable checkbox + allowlist.

## 3. Backend data model & endpoints

New Prisma models (`prisma/schema/supervisor.prisma`), hand-written migrations
(relationMode="prisma": NO FKs, apply via `prisma db execute`, NEVER `migrate dev`):

| Migration                                                     | What                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `20260818000000_add_supervisor_offerings`                     | `SupervisorOffering` + `SupervisorOfferingLicense` tables |
| `20260818000001_rename_medical_director_occupations`          | MD/DO → "Medical Doctor"/"Physician" (+ profile remap)    |
| `20260819000000_add_supervisor_board_certifications`          | `SupervisorBoardCertification` table                      |
| `20260819100000_remove_medical_director_physician_occupation` | Removed "Physician" — MD keeps ONE occupation             |

All idempotent. Deploy to other envs:
`npx prisma db execute --file <migration> --schema prisma/schema` (in order) →
`npx prisma generate` → `node prisma/seed-supervisor-type.js` (rename-aware upsert).

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
- Dashboard My Profile subline + `/find-supervisors` card labels show all roles;
  in supervisors mode an offering-MD card shows the OFFERING role only.
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

## 6. Testing status

- Frontend: **181 vitest tests** pass; lint (0 warnings), tsc, production build clean.
- Backend script tests (node): offerings validator 15, board certs 12, profile
  update MD fields 11, patient population 5, professional credentials 14, search
  mode integration 13 (self-cleaning; requires local DB; NOTE: requiring
  supervision_service opens Redis handles → scripts must `process.exit`;
  `acceptingSupervisees` is an unconditional equality filter — pass `true`).
- Admin: tsc + next lint + build clean (no test suite).
- Pre-existing failures (NOT from this work): backend
  `tests/supervisee_eligibility.test.js` 4 failures (present on clean HEAD
  82c57ba2); 2 admin lint warnings in `useSupervisorLogic.ts`.

## 7. Pending / known limitations / enhancement ideas

**Must do before release**

- [ ] Manual QA of all four signup flows, both edit UIs, both find pages, dashboard.
- [ ] Commit all three repos (single feature branch each: `as/fas-enhacements`).
- [ ] Apply the 4 migrations + reseed on staging/prod DBs (steps above).

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
