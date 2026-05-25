/**
 * Public supervisors index page — /supervisors
 * Lists top states and provides an entry point for pSEO and direct searches.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/jsonld'
import {
  licenseSlugToLabel,
  stateSlugToDisplayName,
  TOP_LICENSE_SLUGS_FOR_STATE,
  US_STATES,
} from '@/lib/seo/routes'

export const metadata: Metadata = buildMetadata({
  title: `Find Clinical Supervisors | ${SITE_NAME}`,
  description: `Browse licensed clinical supervisors by state, license type, and specialty. Find the right supervisor for your LCSW, LMFT, LPC, or LMHC licensure journey on ${SITE_NAME}.`,
  path: '/supervisors',
})

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

/**
 * Best representative state per license type — used for the "Browse by License Type"
 * quick links, since license pages live under /supervisors/[state]/[slug].
 */
const LICENSE_FEATURED_STATE: Record<string, string> = {
  lcsw: 'california',
  lmft: 'california',
  lpc: 'texas',
  lmhc: 'new-york',
  lpcc: 'california',
  lcpc: 'illinois',
  lmsw: 'new-york',
}

export default function SupervisorsIndexPage() {
  return (
    <>
      <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Hero */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find Licensed Clinical Supervisors
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse supervisors by state, license type, or specialty. Connect with verified clinical
            supervisors who match your licensure requirements.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Find My Supervisor
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent"
            >
              Create Free Account
            </Link>
          </div>
        </header>

        {/* Browse by state */}
        <section aria-labelledby="states-heading" className="mb-12">
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
                <span>Clinical Supervisors in {stateSlugToDisplayName(slug)}</span>
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
                <span>Clinical Supervisors in {stateSlugToDisplayName(slug)}</span>
                <span aria-hidden="true" className="text-muted-foreground">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by license type */}
        <section aria-labelledby="licenses-heading" className="mb-12">
          <h2 id="licenses-heading" className="mb-4 text-2xl font-bold text-foreground">
            Browse by License Type
          </h2>
          <p className="mb-4 text-muted-foreground">
            Find supervisors specializing in your specific license type across all states.
          </p>
          <div className="flex flex-wrap gap-3">
            {TOP_LICENSE_SLUGS_FOR_STATE.map((slug) => {
              const stateSlug = LICENSE_FEATURED_STATE[slug] ?? 'california'
              return (
                <Link
                  key={slug}
                  href={`/supervisors/${stateSlug}/${slug}`}
                  className="rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {licenseSlugToLabel(slug)} Supervisors
                </Link>
              )
            })}
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
    </>
  )
}

const WHY_FEATURES = [
  {
    title: 'Verified Supervisors',
    body: 'All supervisors go through a verification process so you can connect with confidence.',
  },
  {
    title: 'Filter by License Type',
    body: 'Search by LCSW, LMFT, LPC, LMHC, and more. Find supervisors qualified for your specific licensure path.',
  },
  {
    title: 'Browse by State',
    body: 'Find supervisors licensed in your state, including those who offer virtual supervision.',
  },
  {
    title: 'Read Reviews',
    body: 'View ratings and reviews from past supervisees to make an informed decision.',
  },
  {
    title: 'Direct Messaging',
    body: 'Message supervisors directly after connecting to discuss your goals and supervision needs.',
  },
  {
    title: 'Transparent Fees',
    body: 'Supervisors list their rates so you can find a match that fits your budget.',
  },
]
