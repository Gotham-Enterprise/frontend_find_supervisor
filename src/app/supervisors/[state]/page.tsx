/**
 * pSEO state landing page — /supervisors/[state]
 * e.g. /supervisors/texas → "Healthcare Supervisors in Texas"
 *
 * Targets keywords like:
 *   - "healthcare supervisors in Texas"
 *   - "collaborating physician in California"
 *   - "find a supervisor in New York"
 *   - "supervising physician in Florida"
 *
 * This is a fully public Server Component. Data comes from the unauthenticated
 * /supervision/search endpoint.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FaqSection } from '@/components/seo/FaqSection'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { fetchPublicSupervisors } from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { getStateFaqs } from '@/lib/seo/faq-data'
import {
  isValidStateSlug,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  SUPERVISOR_TYPE_PAGE_SLUGS,
  US_STATES,
} from '@/lib/seo/routes'

/** Controls whether the page is indexed based on supervisor count. */
const MIN_SUPERVISORS_TO_INDEX = 3

interface Props {
  params: Promise<{ state: string }>
}

// ---------------------------------------------------------------------------
// Static params (generates routes for all US states at build time)
// ---------------------------------------------------------------------------

export const dynamicParams = true

export function generateStaticParams() {
  return Object.keys(US_STATES).map((state) => ({ state }))
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params

  if (!isValidStateSlug(stateSlug)) {
    return { robots: { index: false, follow: true } }
  }

  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()

  // Check supervisor count to decide indexability — avoids thin-page indexing mismatch
  const { supervisors } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    limit: MIN_SUPERVISORS_TO_INDEX,
  })

  if (supervisors.length < MIN_SUPERVISORS_TO_INDEX) {
    return { robots: { index: false, follow: true } }
  }

  return buildMetadata({
    title: `Supervisors in ${stateName}`,
    description: `Find licensed healthcare supervisors, collaborating physicians, and supervising physicians in ${stateName}. Browse by specialty, occupation, and supervision format. Connect with verified ${stateName} supervisors on ${SITE_NAME}.`,
    path: `/supervisors/${stateSlug}`,
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StateSupervisorsPage({ params }: Props) {
  const { state: stateSlug } = await params

  if (!isValidStateSlug(stateSlug)) {
    notFound()
  }

  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()

  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    limit: 20,
  })

  const faqs = getStateFaqs(stateName)

  // Noindex if below threshold — page is still viewable for users
  const shouldIndex = supervisors.length >= MIN_SUPERVISORS_TO_INDEX

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Supervisors', href: '/supervisors' },
    { name: stateName, href: `/supervisors/${stateSlug}` },
  ]

  return (
    <>
      {!shouldIndex && (
        // Inline noindex for thin pages — belt-and-suspenders alongside robots metadata
        <meta name="robots" content="noindex, follow" />
      )}

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Supervisors in {stateName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Browse licensed supervisors, collaborating physicians, and supervising physicians in{' '}
            {stateName}. Filter by specialty, occupation, and supervision format to find the right
            match for your professional needs.
          </p>
          {meta.totalCount > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {meta.totalCount} supervisor{meta.totalCount !== 1 ? 's' : ''} found in {stateName}
            </p>
          )}
        </header>

        {/* Supervisor type quick links */}
        <nav aria-label="Browse by supervisor type" className="mb-5">
          <p className="mb-2 text-sm font-medium text-foreground">Browse by Supervisor Type</p>
          <div className="flex flex-wrap gap-2">
            {SUPERVISOR_TYPE_PAGE_SLUGS.map((typeSlug) => {
              const label =
                typeSlug === 'mental-health-counselor-supervisors'
                  ? 'Mental Health Counselor Supervisors'
                  : typeSlug === 'collaborating-physicians'
                    ? 'Collaborating Physicians'
                    : 'Supervising Physicians'
              return (
                <Link
                  key={typeSlug}
                  href={`/supervisors/${stateSlug}/${typeSlug}`}
                  className="rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {label} in {stateName}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Supervisor grid */}
        {supervisors.length === 0 ? (
          <EmptyState stateName={stateName} />
        ) : (
          <>
            <section aria-labelledby="supervisors-heading">
              <h2 id="supervisors-heading" className="sr-only">
                Supervisors in {stateName}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {supervisors.map((supervisor) => (
                  <SupervisorCard
                    key={supervisor.id}
                    supervisor={supervisor}
                    stateSlug={stateSlug}
                  />
                ))}
              </div>
            </section>

            {/* Pagination hint */}
            {meta.totalCount > supervisors.length && (
              <div className="mt-8 text-center">
                <Link
                  href={`/login?redirect=/find-supervisors`}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign in to see all {meta.totalCount} supervisors in {stateName}
                </Link>
              </div>
            )}
          </>
        )}

        {/* What to look for section */}
        <section aria-labelledby="guide-heading" className="mt-12 rounded-xl bg-muted/40 p-6">
          <h2 id="guide-heading" className="text-xl font-bold text-foreground">
            What to Look for in a Healthcare Supervisor in {stateName}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SUPERVISOR_TIPS.map((tip) => (
              <div key={tip.title} className="flex gap-3">
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <div>
                  <p className="font-medium text-foreground">{tip.title}</p>
                  <p className="text-sm text-muted-foreground">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <FaqSection
          faqs={faqs}
          heading={`Frequently Asked Questions — Supervision in ${stateName}`}
        />

        {/* Related state links */}
        <section aria-labelledby="related-heading" className="mt-12">
          <h2 id="related-heading" className="text-lg font-semibold text-foreground">
            Find Supervisors in Other States
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {NEARBY_STATES.filter((s) => s.slug !== stateSlug).map(({ label, slug }) => (
              <Link
                key={slug}
                href={`/supervisors/${slug}`}
                className="rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({ stateName }: { stateName: string }) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium text-foreground">No supervisors found in {stateName} yet.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        New supervisors join regularly. Try broadening your search to a nearby state.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/supervisors"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse all states
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const SUPERVISOR_TIPS = [
  {
    title: 'Supervisor Type',
    body: 'Identify whether you need a clinical supervisor, collaborating physician, or supervising physician based on your profession and state requirements.',
  },
  {
    title: 'Specialty Match',
    body: 'Look for supervisors or collaborating physicians with experience in your practice area — whether that is mental health, family medicine, psychiatry, or another specialty.',
  },
  {
    title: 'Supervision Format',
    body: 'Decide whether you need in-person, virtual, or hybrid supervision or collaboration. Many supervisors in this state offer flexible scheduling.',
  },
  {
    title: 'License & Credential Compatibility',
    body: 'Confirm the supervisor or collaborating physician holds the credentials required by your state board and has experience working with your profession.',
  },
  {
    title: 'Documentation',
    body: 'Ensure the supervisor or collaborating physician can provide signed documentation or collaboration agreements as required by your state licensing board.',
  },
  {
    title: 'Fees and Availability',
    body: 'Clarify rates, billing frequency, cancellation policy, and how quickly they can take on new supervisees or collaborative partners.',
  },
]

const NEARBY_STATES = [
  { label: 'California', slug: 'california' },
  { label: 'Texas', slug: 'texas' },
  { label: 'Florida', slug: 'florida' },
  { label: 'New York', slug: 'new-york' },
  { label: 'Pennsylvania', slug: 'pennsylvania' },
  { label: 'Illinois', slug: 'illinois' },
  { label: 'Ohio', slug: 'ohio' },
  { label: 'Georgia', slug: 'georgia' },
  { label: 'North Carolina', slug: 'north-carolina' },
  { label: 'Virginia', slug: 'virginia' },
  { label: 'Washington', slug: 'washington' },
  { label: 'Colorado', slug: 'colorado' },
]
