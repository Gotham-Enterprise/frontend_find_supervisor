/**
 * pSEO state landing page — /browse-supervisees/[state]
 * e.g. /browse-supervisees/texas → "Supervisees in Texas"
 *
 * Targets keywords like:
 *   - "supervisees in Texas"
 *   - "pre-licensed counselors looking for supervision in California"
 *   - "NP looking for collaborating physician in Florida"
 *
 * Fully public Server Component. Data comes from the unauthenticated
 * /supervision/supervisee/public-search endpoint (names arrive masked).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { PublicResultsCta } from '@/components/seo/PublicResultsCta'
import { SuperviseeCard } from '@/components/seo/SuperviseeCard'
import { fetchPublicSupervisees } from '@/lib/api/public-supervisees'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import {
  isValidStateSlug,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  US_STATES,
} from '@/lib/seo/routes'

/** Controls whether the page is indexed based on supervisee count. */
const MIN_SUPERVISEES_TO_INDEX = 3

const PUBLIC_RESULTS_LIMIT = 12

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

  // Check supervisee count to decide indexability — avoids thin-page indexing mismatch
  const { supervisees } = await fetchPublicSupervisees({
    state: stateAbbreviation,
    stateFullName: stateName,
    limit: MIN_SUPERVISEES_TO_INDEX,
  })

  if (supervisees.length < MIN_SUPERVISEES_TO_INDEX) {
    return { robots: { index: false, follow: true } }
  }

  return buildMetadata({
    title: `Supervisees in ${stateName} Seeking Supervision`,
    description: `Browse Pre-Licensed Counselors, NPs, PAs, and other healthcare professionals looking for clinical supervision or physician collaboration in ${stateName}. Sign up as a Supervisor to connect on ${SITE_NAME}.`,
    path: `/browse-supervisees/${stateSlug}`,
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StateSuperviseesPage({ params }: Props) {
  const { state: stateSlug } = await params

  if (!isValidStateSlug(stateSlug)) {
    notFound()
  }

  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()

  const { supervisees, meta } = await fetchPublicSupervisees({
    state: stateAbbreviation,
    stateFullName: stateName,
    limit: PUBLIC_RESULTS_LIMIT,
  })

  // Noindex if below threshold — page is still viewable for users
  const shouldIndex = supervisees.length >= MIN_SUPERVISEES_TO_INDEX

  const otherStateSlugs = Object.keys(US_STATES)
    .filter((slug) => slug !== stateSlug)
    .sort()

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Browse Supervisees', href: '/browse-supervisees' },
    { name: stateName, href: `/browse-supervisees/${stateSlug}` },
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
            Supervisees in {stateName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Browse Pre-Licensed Counselors, NPs, PAs, and other healthcare professionals looking for
            clinical supervision or physician collaboration in {stateName}. Sign up as a Supervisor
            to connect with them directly.
          </p>
          {meta.totalCount > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {meta.totalCount} Supervisee{meta.totalCount !== 1 ? 's' : ''} looking in {stateName}
            </p>
          )}
        </header>

        {/* Results */}
        {supervisees.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium text-foreground">
              No Supervisees are currently looking in {stateName}.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              New Supervisees join regularly. Check back soon or browse all Supervisees.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/browse-supervisees"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse all Supervisees
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section aria-labelledby="supervisees-heading">
              <h2 id="supervisees-heading" className="sr-only">
                Supervisees in {stateName}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {supervisees.map((supervisee, index) => (
                  <SuperviseeCard key={supervisee.id} supervisee={supervisee} index={index} />
                ))}
              </div>
            </section>

            <PublicResultsCta
              role="supervisee"
              totalCount={meta.totalCount}
              shownCount={supervisees.length}
              context={`in ${stateName}`}
            />
          </>
        )}

        {/* Browse other states */}
        <section aria-labelledby="other-states-heading" className="mt-12">
          <h2 id="other-states-heading" className="mb-4 text-xl font-bold text-foreground">
            Browse Supervisees in Other States
          </h2>
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
            {otherStateSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/browse-supervisees/${slug}`}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Supervisees in {stateSlugToDisplayName(slug)}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
