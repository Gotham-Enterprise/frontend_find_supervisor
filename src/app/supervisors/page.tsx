/**
 * Public supervisors index page — /supervisors
 *
 * Serves two purposes:
 *  1. SEO landing page with filter-driven search results (server-rendered)
 *  2. Browse-by-state and browse-by-type pSEO navigation
 *
 * Filters are driven by URL query params so results are shareable and
 * server-rendered on every navigation:
 *   /supervisors?state=TX&type=collaborating-physician&format=virtual
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { JsonLd } from '@/components/seo/JsonLd'
import { PublicSearchFilters } from '@/components/seo/PublicSearchFilters'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { fetchPublicSupervisors } from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/jsonld'
import {
  stateSlugToDisplayName,
  SUPERVISOR_TYPE_QUERY_MAP,
  SUPERVISOR_TYPE_SLUGS,
  US_STATES,
} from '@/lib/seo/routes'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = buildMetadata({
  title: `Find Healthcare Supervisors, Collaborating Physicians & Supervising Physicians | ${SITE_NAME}`,
  description: `Search licensed supervisors, collaborating physicians, and supervising physicians by state, city, specialty, occupation, and virtual, hybrid, or in-person format. Browse verified healthcare supervisors across all 50 states.`,
  path: '/supervisors',
})

// ---------------------------------------------------------------------------
// Format param → backend value
// ---------------------------------------------------------------------------

const FORMAT_PARAM_MAP: Record<string, string> = {
  virtual: 'VIRTUAL',
  'in-person': 'IN_PERSON',
  hybrid: 'HYBRID',
}

// ---------------------------------------------------------------------------
// Static browse data
// ---------------------------------------------------------------------------

const TOP_STATE_SLUGS = [
  'california',
  'texas',
  'florida',
  'new-york',
  'pennsylvania',
  'illinois',
  'ohio',
  'georgia',
  'north-carolina',
  'virginia',
  'washington',
  'colorado',
  'arizona',
  'massachusetts',
  'maryland',
  'michigan',
  'tennessee',
  'indiana',
  'missouri',
  'minnesota',
]

const ALL_STATE_SLUGS = Object.keys(US_STATES)
const OTHER_STATE_SLUGS = ALL_STATE_SLUGS.filter((s) => !TOP_STATE_SLUGS.includes(s)).sort()

const PUBLIC_RESULTS_LIMIT = 12

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<{ state?: string; type?: string; format?: string; q?: string }>
}

export default async function SupervisorsIndexPage({ searchParams }: PageProps) {
  const { state, type, format, q } = await searchParams

  // Resolve URL params to API values
  const supervisorTypeName = type ? (SUPERVISOR_TYPE_QUERY_MAP[type] ?? '') : ''
  const supervisionFormat = format ? (FORMAT_PARAM_MAP[format] ?? '') : ''

  const hasFilters = Boolean(state || type || format || q)

  // Fetch results (always — even without filters, show a default listing)
  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: state ?? undefined,
    supervisorType: supervisorTypeName || undefined,
    supervisionFormat: supervisionFormat || undefined,
    keywords: q ?? undefined,
    limit: PUBLIC_RESULTS_LIMIT,
  })

  const initialFilters = {
    q: q ?? '',
    state: state ?? '',
    type: type ?? '',
    format: format ?? '',
  }

  return (
    <>
      <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />

      {/* Sticky filter bar — client component */}
      <Suspense>
        <PublicSearchFilters initialValues={initialFilters} />
      </Suspense>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero (only show when no active filters) */}
        {!hasFilters && (
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find Licensed Supervisors
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Browse licensed supervisors, collaborating Physicians, and supervising Physicians by
              state, city, specialty, occupation, and supervision format.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent"
              >
                Sign In
              </Link>
            </div>
          </header>
        )}

        {/* Filtered heading */}
        {hasFilters && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {buildFilteredHeading({ state, type, format })}
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
              Featured Supervisors
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

              {/* Sign-in CTA when there are more results */}
              {meta.totalCount > supervisors.length && (
                <div className="mt-8 rounded-xl border bg-muted/30 p-6 text-center">
                  <p className="font-medium text-foreground">
                    {meta.totalCount - supervisors.length} more supervisor
                    {meta.totalCount - supervisors.length !== 1 ? 's' : ''} available
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sign in to browse all {meta.totalCount} matching supervisors, filter by
                    availability, patient population, fee range, and more.
                  </p>
                  <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/login?redirect=/find-supervisors"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Sign in to see all results
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      Create free account
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <div className="mt-16 space-y-12">
          {/* Browse by supervisor type */}
          <section aria-labelledby="types-heading">
            <h2 id="types-heading" className="mb-4 text-2xl font-bold text-foreground">
              Browse by Supervisor Type
            </h2>
            <p className="mb-4 text-muted-foreground">
              Find the right type of supervisor or collaborating Physician for your profession and
              state requirements.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {SUPERVISOR_TYPE_SLUGS.map(({ slug, label, description, href }) => (
                <Link
                  key={slug}
                  href={href}
                  className="flex flex-col gap-1 rounded-xl border bg-card px-5 py-4 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Browse by state */}
          <section aria-labelledby="states-heading">
            <h2 id="states-heading" className="mb-6 text-2xl font-bold text-foreground">
              Browse Supervisors by State
            </h2>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Popular States
            </h3>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {TOP_STATE_SLUGS.map((slug) => (
                <Link
                  key={slug}
                  href={`/supervisors/${slug}`}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  <span>Supervisors in {stateSlugToDisplayName(slug)}</span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    →
                  </span>
                </Link>
              ))}
            </div>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              All Other States
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {OTHER_STATE_SLUGS.map((slug) => (
                <Link
                  key={slug}
                  href={`/supervisors/${slug}`}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  <span>Supervisors in {stateSlugToDisplayName(slug)}</span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Why use us */}
          <section aria-labelledby="why-heading" className="rounded-2xl bg-muted/40 p-8">
            <h2 id="why-heading" className="mb-6 text-2xl font-bold text-foreground">
              Why Use {SITE_NAME}?
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
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFilteredHeading({
  state,
  type,
  format,
}: {
  state?: string
  type?: string
  format?: string
}): string {
  const typeLabel = type ? (SUPERVISOR_TYPE_QUERY_MAP[type] ?? null) : null
  const stateLabel = state ?? null
  const formatLabel = format
    ? format.charAt(0).toUpperCase() + format.slice(1).replace('-', '-')
    : null

  const parts: string[] = []
  if (typeLabel) parts.push(typeLabel)
  else parts.push('Supervisors')
  if (stateLabel) parts.push(`in ${stateLabel}`)
  if (formatLabel && !typeLabel) parts.push(`— ${formatLabel}`)
  else if (formatLabel) parts.push(`(${formatLabel})`)

  return parts.join(' ')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NoResultsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium text-foreground">
        {hasFilters ? 'No supervisors match your filters.' : 'No supervisors found.'}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasFilters
          ? 'Try broadening your search — remove a filter or change the state.'
          : 'New supervisors join regularly. Check back soon or browse by state.'}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {hasFilters ? (
          <Link
            href="/supervisors"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Clear all filters
          </Link>
        ) : (
          <Link
            href="/supervisors"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse all supervisors
          </Link>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const WHY_FEATURES = [
  {
    title: 'Verified Supervisors',
    body: 'All supervisors, collaborating physicians, and supervising physicians go through a verification process so you can connect with confidence.',
  },
  {
    title: 'Multiple Supervisor Types',
    body: 'Find mental health counselor supervisors, collaborating physicians for NPs, and supervising physicians for PAs — all in one place.',
  },
  {
    title: 'Browse by State',
    body: 'Find supervisors and collaborating physicians licensed in your state, including those who offer virtual or hybrid supervision.',
  },
  {
    title: 'Filter by Specialty & Format',
    body: 'Filter by specialty, occupation, supervision format (virtual, hybrid, in-person), and availability to find the right match.',
  },
  {
    title: 'Direct Messaging',
    body: 'Message supervisors directly after connecting to discuss your goals, specialty, and collaboration needs.',
  },
  {
    title: 'Transparent Fees',
    body: 'Supervisors and collaborating physicians list their rates so you can find a match that fits your budget.',
  },
]
