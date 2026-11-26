/**
 * Public Preceptors index page — /preceptors
 *
 * Serves two purposes:
 *  1. SEO landing page with filter-driven search results (server-rendered)
 *  2. Browse-by-state pSEO navigation
 *
 * Lists primary Preceptors only (searchMode=preceptors): licensed clinicians
 * who host students for the clinical/field hours their degree program
 * requires. Filters are driven by URL query params so results are shareable
 * and server-rendered on every navigation:
 *   /preceptors?state=TX&discipline=dentist&format=in-person&q=pediatric
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { FaqSection } from '@/components/seo/FaqSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { PublicResultsCta } from '@/components/seo/PublicResultsCta'
import { PublicSearchFilters } from '@/components/seo/PublicSearchFilters'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { fetchPublicSupervisors } from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { getPreceptorIndexFaqs } from '@/lib/seo/faq-data'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/jsonld'
import {
  PRECEPTOR_DISCIPLINE_SLUG_MAP,
  PRECEPTORS_PATH,
  stateAbbreviationToDisplayName,
  stateAbbreviationToSlug,
  stateSlugToDisplayName,
  TOP_STATE_SLUGS,
  US_STATES,
} from '@/lib/seo/routes'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = buildMetadata({
  title: 'Find a Preceptor for Your Clinical Rotation',
  description: `Search verified preceptors by state, discipline, and format. Nurse Practitioners, Physicians, Physical Therapists, Pharmacists, Dentists, Occupational Therapists, and Speech Language Pathologists hosting NP, PA, PT, PTA, dental, COTA, SLP, and pharmacy students on ${SITE_NAME}.`,
  path: PRECEPTORS_PATH,
})

// ---------------------------------------------------------------------------
// Param maps
// ---------------------------------------------------------------------------

const FORMAT_PARAM_MAP: Record<string, string> = {
  virtual: 'VIRTUAL',
  'in-person': 'IN_PERSON',
  hybrid: 'HYBRID',
}

const FORMAT_LABELS: Record<string, string> = {
  virtual: 'Virtual',
  'in-person': 'In-Person',
  hybrid: 'Hybrid',
}

const DISCIPLINE_OPTIONS = Object.entries(PRECEPTOR_DISCIPLINE_SLUG_MAP).map(([slug, name]) => ({
  label: name,
  value: slug,
}))

// ---------------------------------------------------------------------------
// Static browse data
// ---------------------------------------------------------------------------

const OTHER_STATE_SLUGS = Object.keys(US_STATES)
  .filter((s) => !TOP_STATE_SLUGS.includes(s))
  .sort()

const PUBLIC_RESULTS_LIMIT = 21

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<{ state?: string; discipline?: string; format?: string; q?: string }>
}

export default async function PreceptorsIndexPage({ searchParams }: PageProps) {
  const { state: rawState, discipline: rawDiscipline, format: rawFormat, q } = await searchParams

  // Unknown values are ignored rather than echoed into the heading/filter chip
  // (same policy as /supervisors, JF-2536).
  const state = rawState && stateAbbreviationToSlug(rawState) ? rawState.toUpperCase() : undefined
  const discipline =
    rawDiscipline && PRECEPTOR_DISCIPLINE_SLUG_MAP[rawDiscipline.toLowerCase()]
      ? rawDiscipline.toLowerCase()
      : undefined
  const format =
    rawFormat && FORMAT_PARAM_MAP[rawFormat.toLowerCase()] ? rawFormat.toLowerCase() : undefined

  const hasFilters = Boolean(state || discipline || format || q)

  // Fetch results (always — even without filters, show a default listing)
  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: state,
    stateFullName: state ? stateAbbreviationToDisplayName(state) : undefined,
    supervisorOccupation: discipline ? PRECEPTOR_DISCIPLINE_SLUG_MAP[discipline] : undefined,
    supervisionFormat: format ? FORMAT_PARAM_MAP[format] : undefined,
    keywords: q ?? undefined,
    searchMode: 'preceptors',
    limit: PUBLIC_RESULTS_LIMIT,
  })

  const initialFilters = {
    q: q ?? '',
    state: state ?? '',
    type: discipline ?? '',
    format: format ?? '',
  }

  return (
    <>
      <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />

      {/* Sticky filter bar — client component */}
      <Suspense>
        <PublicSearchFilters
          initialValues={initialFilters}
          basePath={PRECEPTORS_PATH}
          typeOptions={DISCIPLINE_OPTIONS}
          typeParam="discipline"
          typeLabel="Filter by discipline"
          typeAllLabel="All Disciplines"
          noun="preceptors"
        />
      </Suspense>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero (only show when no active filters) */}
        {!hasFilters && (
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find a Preceptor
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Browse verified preceptors by state, discipline, and format. Licensed clinicians host
              students for the clinical and field hours their degree program requires.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup?type=preceptee"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create Free Student Account
              </Link>
              <Link
                href="/signup?type=preceptor"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent"
              >
                I&apos;m a Preceptor
              </Link>
            </div>
          </header>
        )}

        {/* Filtered heading */}
        {hasFilters && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {buildFilteredHeading({ state, discipline, format })}
            </h1>
            {meta.totalCount > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {meta.totalCount} result{meta.totalCount !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        )}

        {/* Results */}
        <section aria-labelledby="results-heading">
          {!hasFilters && (
            <h2 id="results-heading" className="mb-4 text-xl font-semibold text-foreground">
              Featured Preceptors
            </h2>
          )}
          {supervisors.length === 0 ? (
            <NoResultsState hasFilters={hasFilters} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {supervisors.map((supervisor) => (
                  <SupervisorCard key={supervisor.id} supervisor={supervisor} />
                ))}
              </div>

              {/* Always-on sign-up CTA — the registration funnel for students */}
              <PublicResultsCta
                role="preceptor"
                totalCount={meta.totalCount}
                shownCount={supervisors.length}
              />
            </>
          )}
        </section>

        <div className="mt-16 space-y-12">
          {/* Who the preceptors are */}
          <section aria-labelledby="disciplines-heading">
            <h2 id="disciplines-heading" className="mb-4 text-2xl font-bold text-foreground">
              Preceptors by Discipline
            </h2>
            <p className="mb-4 text-muted-foreground">
              Students only see preceptors whose discipline matches their program. Pick yours to
              narrow the list.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DISCIPLINES.map((d) => (
                <Link
                  key={d.slug}
                  href={`${PRECEPTORS_PATH}?discipline=${d.slug}`}
                  className="flex flex-col gap-1 rounded-xl border bg-card px-5 py-4 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-sm font-semibold text-foreground">{d.title}</span>
                  <span className="text-xs text-muted-foreground">{d.body}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Browse by state */}
          <section aria-labelledby="states-heading">
            <h2 id="states-heading" className="mb-6 text-2xl font-bold text-foreground">
              Browse Preceptors by State
            </h2>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Popular States
            </h3>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {TOP_STATE_SLUGS.map((slug) => (
                <StateLink key={slug} slug={slug} />
              ))}
            </div>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              All Other States
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {OTHER_STATE_SLUGS.map((slug) => (
                <StateLink key={slug} slug={slug} />
              ))}
            </div>
          </section>

          {/* Why use us */}
          <section aria-labelledby="why-heading" className="rounded-2xl bg-muted/40 p-8">
            <h2 id="why-heading" className="mb-6 text-2xl font-bold text-foreground">
              Why Find a Preceptor on {SITE_NAME}?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_FEATURES.map((f) => (
                <div key={f.title}>
                  <p className="font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <FaqSection
          faqs={getPreceptorIndexFaqs()}
          heading="Frequently Asked Questions About Preceptors"
        />

        {/* Cross-link to the other directories */}
        <section aria-labelledby="supervisors-link-heading" className="mt-12">
          <h2 id="supervisors-link-heading" className="text-lg font-semibold text-foreground">
            Already licensed and looking for a Supervisor?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nurse Practitioners, Physician Assistants, and pre-licensed mental health professionals
            can browse Supervisors, Collaborating Physicians, and Supervising Physicians.
          </p>
          <Link
            href="/supervisors"
            className="mt-3 inline-block text-sm font-medium text-primary transition-colors hover:underline"
          >
            Browse Supervisors →
          </Link>
        </section>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFilteredHeading({
  state,
  discipline,
  format,
}: {
  state?: string
  discipline?: string
  format?: string
}): string {
  const parts = [
    discipline ? `${PRECEPTOR_DISCIPLINE_SLUG_MAP[discipline]} Preceptors` : 'Preceptors',
  ]
  if (state) parts.push(`in ${stateAbbreviationToDisplayName(state)}`)
  if (format) parts.push(`(${FORMAT_LABELS[format]})`)
  return parts.join(' ')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StateLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`${PRECEPTORS_PATH}/${slug}`}
      className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
    >
      <span>Preceptors in {stateSlugToDisplayName(slug)}</span>
      <span aria-hidden="true" className="text-muted-foreground">
        →
      </span>
    </Link>
  )
}

function NoResultsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium text-foreground">
        {hasFilters ? 'No Preceptors match your filters.' : 'No Preceptors found.'}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasFilters
          ? 'Try broadening your search. Remove a filter or change the state.'
          : 'New Preceptors join regularly. Check back soon or browse by state.'}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={PRECEPTORS_PATH}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {hasFilters ? 'Clear all filters' : 'Browse all Preceptors'}
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const DISCIPLINES = [
  {
    slug: 'nurse-practitioner',
    title: 'Nurse Practitioner Preceptors',
    body: 'Host NP and PA students for primary care, pediatrics, women’s health, psychiatric, and acute care rotations.',
  },
  {
    slug: 'physician',
    title: 'Physician Preceptors',
    body: 'MDs and DOs hosting NP and PA students across family medicine, internal medicine, emergency medicine, and specialties.',
  },
  {
    slug: 'physical-therapist',
    title: 'Physical Therapist Preceptors',
    body: 'Clinical instructors for PT and PTA students in outpatient, acute care, rehab, neuro, and pediatric settings.',
  },
  {
    slug: 'pharmacist',
    title: 'Pharmacist Preceptors',
    body: 'Host pharmacy students for IPPE and APPE rotations in community, hospital, ambulatory, and clinical pharmacy.',
  },
  {
    slug: 'dentist',
    title: 'Dentist Preceptors',
    body: 'Host dental hygiene and dental assistant students in general, pediatric, and specialty practices.',
  },
  {
    slug: 'occupational-therapist',
    title: 'Occupational Therapist Preceptors',
    body: 'Fieldwork educators for COTA students in pediatrics, mental health, rehab, school-based, and geriatric settings.',
  },
  {
    slug: 'speech-language-pathologist',
    title: 'Speech Language Pathologist Preceptors',
    body: 'Clinical supervisors for SLP students in schools, early intervention, acute care, and outpatient clinics.',
  },
]

const WHY_FEATURES = [
  {
    title: 'Verified Preceptors',
    body: 'Every preceptor goes through a verification process before their profile appears in the directory.',
  },
  {
    title: 'Matched to Your Program',
    body: 'Students only see preceptors whose discipline can host their rotation, so every result is relevant.',
  },
  {
    title: 'Licensed-State Visibility',
    body: 'Each profile lists every state where the preceptor is licensed, so you can confirm coverage before reaching out.',
  },
  {
    title: 'Specialty Focus',
    body: 'See each preceptor’s practice setting and specialty focus to match the rotation your program requires.',
  },
  {
    title: 'Transparent Fees',
    body: 'Preceptors list their fee up front so you can compare options that fit your budget.',
  },
  {
    title: 'Direct Messaging',
    body: 'Message preceptors directly to confirm dates, hours, and program paperwork before you request a placement.',
  },
]
