/**
 * Public Medical Directors index page — /medical-directors
 *
 * Serves two purposes:
 *  1. SEO landing page with filter-driven search results (server-rendered)
 *  2. Browse-by-state pSEO navigation
 *
 * Lists primary Medical Directors only (searchMode=medicalDirectors). Filters
 * are driven by URL query params so results are shareable and server-rendered
 * on every navigation:
 *   /medical-directors?state=TX&format=virtual&q=dermatology
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { StateCorporatePracticeChecker } from '@/components/CorporatePracticeGuide/StateCorporatePracticeChecker'
import { FaqSection } from '@/components/seo/FaqSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { PublicResultsCta } from '@/components/seo/PublicResultsCta'
import { PublicSearchFilters } from '@/components/seo/PublicSearchFilters'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { fetchPublicSupervisors } from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { getMedicalDirectorIndexFaqs } from '@/lib/seo/faq-data'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/jsonld'
import {
  MEDICAL_DIRECTORS_PATH,
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
  title: 'Find a Medical Director for Your Med Spa, Clinic, or Practice',
  description: `Search verified Medical Directors (MDs and DOs) by state, specialty, and virtual, hybrid, or in-person format. Find physician oversight for med spas, IV therapy clinics, wellness centers, telehealth, and NP-led practices on ${SITE_NAME}.`,
  path: MEDICAL_DIRECTORS_PATH,
})

// ---------------------------------------------------------------------------
// Format param → backend value
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

// ---------------------------------------------------------------------------
// Static browse data
// ---------------------------------------------------------------------------

const OTHER_STATE_SLUGS = Object.keys(US_STATES)
  .filter((s) => !TOP_STATE_SLUGS.includes(s))
  .sort()

const PUBLIC_RESULTS_LIMIT = 12

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<{ state?: string; format?: string; q?: string }>
}

export default async function MedicalDirectorsIndexPage({ searchParams }: PageProps) {
  const { state: rawState, format: rawFormat, q } = await searchParams

  // Unknown values are ignored rather than echoed into the heading/filter chip
  // (same policy as /supervisors, JF-2536).
  const state = rawState && stateAbbreviationToSlug(rawState) ? rawState.toUpperCase() : undefined
  const format =
    rawFormat && FORMAT_PARAM_MAP[rawFormat.toLowerCase()] ? rawFormat.toLowerCase() : undefined

  const hasFilters = Boolean(state || format || q)

  // Fetch results (always — even without filters, show a default listing)
  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: state,
    stateFullName: state ? stateAbbreviationToDisplayName(state) : undefined,
    supervisionFormat: format ? FORMAT_PARAM_MAP[format] : undefined,
    keywords: q ?? undefined,
    searchMode: 'medicalDirectors',
    limit: PUBLIC_RESULTS_LIMIT,
  })

  const initialFilters = {
    q: q ?? '',
    state: state ?? '',
    type: '',
    format: format ?? '',
  }

  return (
    <>
      <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />

      {/* Sticky filter bar — client component */}
      <Suspense>
        <PublicSearchFilters
          initialValues={initialFilters}
          basePath={MEDICAL_DIRECTORS_PATH}
          showTypeFilter={false}
          noun="Medical Directors"
        />
      </Suspense>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero (only show when no active filters) */}
        {!hasFilters && (
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find a Medical Director
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Browse verified Medical Directors (MDs and DOs) by state, specialty, and format. Find
              physician oversight for med spas, clinics, wellness centers, telehealth, and NP-led
              practices.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup?type=need-medical-director"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create Free Account
              </Link>
              <Link
                href="/signup?type=medical-director"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent"
              >
                I&apos;m a Medical Director
              </Link>
            </div>
          </header>
        )}

        {/* Filtered heading */}
        {hasFilters && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {buildFilteredHeading({ state, format })}
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
              Featured Medical Directors
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

              {/* Always-on sign-up CTA — the registration funnel for practices */}
              <PublicResultsCta
                role="medicalDirector"
                totalCount={meta.totalCount}
                shownCount={supervisors.length}
              />
            </>
          )}
        </section>

        <div className="mt-16 space-y-12">
          {/* Who needs a Medical Director */}
          <section aria-labelledby="who-heading">
            <h2 id="who-heading" className="mb-4 text-2xl font-bold text-foreground">
              Who Needs a Medical Director?
            </h2>
            <p className="mb-4 text-muted-foreground">
              Many practices that offer medical services need a physician for clinical oversight.
              Each state sets its own rules, so check with your state boards.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PRACTICE_TYPES.map((p) => (
                <div key={p.title} className="rounded-xl border bg-card px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Corporate Practice of Medicine rules per state (client-side picker) */}
          <StateCorporatePracticeChecker />

          {/* Browse by state */}
          <section aria-labelledby="states-heading">
            <h2 id="states-heading" className="mb-6 text-2xl font-bold text-foreground">
              Browse Medical Directors by State
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
              Why Find a Medical Director on {SITE_NAME}?
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
          faqs={getMedicalDirectorIndexFaqs()}
          heading="Frequently Asked Questions About Medical Directors"
        />

        {/* Cross-link to the supervisor directory */}
        <section aria-labelledby="supervisors-link-heading" className="mt-12">
          <h2 id="supervisors-link-heading" className="text-lg font-semibold text-foreground">
            Looking for a Supervisor or Collaborating Physician?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nurse practitioners, physician assistants, and pre-licensed mental health professionals
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

function buildFilteredHeading({ state, format }: { state?: string; format?: string }): string {
  const parts = ['Medical Directors']
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
      href={`${MEDICAL_DIRECTORS_PATH}/${slug}`}
      className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
    >
      <span>Medical Directors in {stateSlugToDisplayName(slug)}</span>
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
        {hasFilters ? 'No Medical Directors match your filters.' : 'No Medical Directors found.'}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasFilters
          ? 'Try broadening your search. Remove a filter or change the state.'
          : 'New Medical Directors join regularly. Check back soon or browse by state.'}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={MEDICAL_DIRECTORS_PATH}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {hasFilters ? 'Clear all filters' : 'Browse all Medical Directors'}
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const PRACTICE_TYPES = [
  {
    title: 'Med Spas & Aesthetics',
    body: 'Injectables, laser treatments, and other aesthetic procedures commonly require physician oversight and approved protocols.',
  },
  {
    title: 'IV Therapy & Hydration Clinics',
    body: 'IV infusions and injections are typically performed under a Medical Director’s standing orders.',
  },
  {
    title: 'Weight Loss & Wellness Clinics',
    body: 'Prescription weight management, hormone therapy, and wellness programs often need a supervising physician.',
  },
  {
    title: 'Telehealth Companies',
    body: 'Virtual care platforms rely on Medical Directors for clinical policies, quality review, and multi-state coverage.',
  },
  {
    title: 'NP & PA-Owned Practices',
    body: 'Advanced practice providers may need a Medical Director depending on their state, services, and business structure.',
  },
  {
    title: 'Urgent Care & Specialty Clinics',
    body: 'Clinics with mixed clinical teams use a Medical Director for oversight, credentialing, and compliance.',
  },
]

const WHY_FEATURES = [
  {
    title: 'Verified Physicians',
    body: 'Every Medical Director goes through a verification process before their profile appears in the directory.',
  },
  {
    title: 'Licensed-State Visibility',
    body: 'Each profile lists every state where the Medical Director is licensed, so you can confirm coverage before reaching out.',
  },
  {
    title: 'Board Certifications',
    body: 'See certifying boards and specialties up front to match a Medical Director to the services you offer.',
  },
  {
    title: 'Flexible Formats',
    body: 'Find Medical Directors who offer virtual, hybrid, or in-person oversight to fit your practice.',
  },
  {
    title: 'Transparent Monthly Fees',
    body: 'Medical Directors list their monthly rates so you can compare options that fit your budget.',
  },
  {
    title: 'Direct Messaging',
    body: 'Message Medical Directors directly to discuss your services, protocols, and expectations before you hire.',
  },
]
