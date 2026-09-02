/**
 * Public supervisees browse page — /browse-supervisees
 *
 * The guest-facing counterpart of /supervisors: prospective Supervisors can
 * browse Supervisees who are looking for supervision, then sign up to connect.
 * Supervisee names arrive already masked server-side ("Maria S").
 *
 * Filters are driven by URL query params so results are shareable and
 * server-rendered on every navigation:
 *   /browse-supervisees?state=TX&format=virtual&q=counseling
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { JsonLd } from '@/components/seo/JsonLd'
import { PublicResultsCta } from '@/components/seo/PublicResultsCta'
import { PublicSuperviseeFilters } from '@/components/seo/PublicSuperviseeFilters'
import { SuperviseeCard } from '@/components/seo/SuperviseeCard'
import { fetchPublicSupervisees } from '@/lib/api/public-supervisees'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/jsonld'
import {
  stateAbbreviationToDisplayName,
  stateAbbreviationToSlug,
  stateSlugToDisplayName,
  US_STATES,
} from '@/lib/seo/routes'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = buildMetadata({
  title: `Find Supervisees Seeking Supervision | ${SITE_NAME}`,
  description: `Browse pre-licensed professionals and healthcare providers looking for clinical supervision or physician collaboration. Filter Supervisees by state and supervision format, then sign up as a Supervisor to connect.`,
  path: '/browse-supervisees',
})

// ---------------------------------------------------------------------------
// Format param → backend value
// ---------------------------------------------------------------------------

const FORMAT_PARAM_MAP: Record<string, string> = {
  virtual: 'VIRTUAL',
  'in-person': 'IN_PERSON',
  hybrid: 'HYBRID',
}

const PUBLIC_RESULTS_LIMIT = 12

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
]

const ALL_STATE_SLUGS = Object.keys(US_STATES)
const OTHER_STATE_SLUGS = ALL_STATE_SLUGS.filter((s) => !TOP_STATE_SLUGS.includes(s)).sort()

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<{ state?: string; format?: string; q?: string }>
}

export default async function BrowseSuperviseesPage({ searchParams }: PageProps) {
  const { state: rawState, format, q } = await searchParams

  // Unknown state codes are ignored rather than echoed into the heading/filter
  // chip (JF-2536: ?state=ZZ must not render a "ZZ" filter) — same policy as
  // unknown format params.
  const state = rawState && stateAbbreviationToSlug(rawState) ? rawState.toUpperCase() : undefined
  const preferredFormat = format ? (FORMAT_PARAM_MAP[format] ?? '') : ''
  const hasFilters = Boolean(state || format || q)

  // Fetch results (always — even without filters, show a default listing)
  const { supervisees, meta } = await fetchPublicSupervisees({
    state: state ?? undefined,
    stateFullName: state ? stateAbbreviationToDisplayName(state) : undefined,
    preferredFormat: preferredFormat || undefined,
    keywords: q ?? undefined,
    limit: PUBLIC_RESULTS_LIMIT,
  })

  const initialFilters = {
    q: q ?? '',
    state: state ?? '',
    format: format ?? '',
  }

  return (
    <>
      <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />

      {/* Sticky filter bar — client component */}
      <Suspense>
        <PublicSuperviseeFilters initialValues={initialFilters} />
      </Suspense>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero (only show when no active filters) */}
        {!hasFilters && (
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find Supervisees Looking for Supervision
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Browse Pre-Licensed Counselors, NPs, PAs, and other healthcare professionals seeking
              clinical supervision or physician collaboration — filtered by state and supervision
              format.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup?type=supervisor"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create Free Supervisor Account
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
              Supervisees Looking Now
            </h2>
          )}
          {supervisees.length === 0 ? (
            <NoResultsState hasFilters={hasFilters} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {supervisees.map((supervisee, index) => (
                  <SuperviseeCard key={supervisee.id} supervisee={supervisee} index={index} />
                ))}
              </div>

              {/* Always-on sign-up CTA — the registration funnel for visiting Supervisors */}
              <PublicResultsCta
                role="supervisee"
                totalCount={meta.totalCount}
                shownCount={supervisees.length}
              />
            </>
          )}
        </section>

        {/* Browse by state */}
        <section aria-labelledby="states-heading" className="mt-16">
          <h2 id="states-heading" className="mb-6 text-2xl font-bold text-foreground">
            Browse Supervisees by State
          </h2>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Popular States
          </h3>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {TOP_STATE_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/browse-supervisees/${slug}`}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <span>Supervisees in {stateSlugToDisplayName(slug)}</span>
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
                href={`/browse-supervisees/${slug}`}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <span>Supervisees in {stateSlugToDisplayName(slug)}</span>
                <span aria-hidden="true" className="text-muted-foreground">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Why use us */}
        <section aria-labelledby="why-heading" className="mt-16 rounded-2xl bg-muted/40 p-8">
          <h2 id="why-heading" className="mb-6 text-2xl font-bold text-foreground">
            Why Find Supervisees on {SITE_NAME}?
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
    </>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFilteredHeading({ state, format }: { state?: string; format?: string }): string {
  const stateLabel = state ? stateAbbreviationToDisplayName(state) : null
  const formatLabel = format ? format.charAt(0).toUpperCase() + format.slice(1) : null

  const parts: string[] = ['Supervisees']
  if (stateLabel) parts.push(`in ${stateLabel}`)
  if (formatLabel) parts.push(`— ${formatLabel}`)

  return parts.join(' ')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NoResultsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium text-foreground">
        {hasFilters ? 'No Supervisees match your filters.' : 'No Supervisees found.'}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasFilters
          ? 'Try broadening your search — remove a filter or change the state.'
          : 'New Supervisees join regularly. Check back soon.'}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/browse-supervisees"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {hasFilters ? 'Clear all filters' : 'Browse all Supervisees'}
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const WHY_FEATURES = [
  {
    title: 'Supervisees Actively Looking',
    body: 'Every listed Supervisee is looking for a Supervisor or Collaborating Physician right now, with their timeline and preferred format up front.',
  },
  {
    title: 'Transparent Budgets',
    body: 'Supervisees share their budget range so you can find matches that fit your supervision rates before you connect.',
  },
  {
    title: 'Filter by State & Format',
    body: 'Find Supervisees looking in the states where you are licensed, whether they want virtual, hybrid, or in-person supervision.',
  },
  {
    title: 'Best Matches for Your Profile',
    body: 'After signing up, results are ranked against your occupation, specialty, states, and rates so the best-fit Supervisees come first.',
  },
  {
    title: 'Direct Messaging',
    body: 'Message Supervisees directly after connecting to discuss their goals, hours, and supervision needs.',
  },
  {
    title: 'Simple, Managed Supervision',
    body: 'Hire requests, agreements, and monthly payments are all handled on the platform once you match.',
  },
]
