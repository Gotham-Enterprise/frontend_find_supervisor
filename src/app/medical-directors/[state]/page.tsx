/**
 * pSEO state landing page — /medical-directors/[state]
 * e.g. /medical-directors/texas → "Medical Directors in Texas"
 *
 * Targets keywords like:
 *   - "medical director in Texas"
 *   - "med spa medical director California"
 *   - "find a medical director in Florida"
 *
 * This is a fully public Server Component. Data comes from the unauthenticated
 * /supervision/search endpoint scoped to primary Medical Directors.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FaqSection } from '@/components/seo/FaqSection'
import { PublicResultsCta } from '@/components/seo/PublicResultsCta'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { fetchPublicSupervisors } from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { getMedicalDirectorStateFaqs } from '@/lib/seo/faq-data'
import {
  isValidStateSlug,
  MEDICAL_DIRECTORS_PATH,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  TOP_STATE_SLUGS,
  US_STATES,
} from '@/lib/seo/routes'

/** Controls whether the page is indexed based on Medical Director count. */
const MIN_MEDICAL_DIRECTORS_TO_INDEX = 3

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

  // Check Medical Director count to decide indexability — avoids thin-page indexing
  const { supervisors } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    searchMode: 'medicalDirectors',
    limit: MIN_MEDICAL_DIRECTORS_TO_INDEX,
  })

  if (supervisors.length < MIN_MEDICAL_DIRECTORS_TO_INDEX) {
    return { robots: { index: false, follow: true } }
  }

  return buildMetadata({
    title: `Medical Directors in ${stateName}`,
    description: `Find verified Medical Directors (MDs and DOs) licensed in ${stateName} for med spas, IV therapy clinics, wellness centers, telehealth, and NP-led practices. Compare specialties, board certifications, format, and monthly fees on ${SITE_NAME}.`,
    path: `${MEDICAL_DIRECTORS_PATH}/${stateSlug}`,
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StateMedicalDirectorsPage({ params }: Props) {
  const { state: stateSlug } = await params

  if (!isValidStateSlug(stateSlug)) {
    notFound()
  }

  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()

  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    searchMode: 'medicalDirectors',
    limit: 20,
  })

  const faqs = getMedicalDirectorStateFaqs(stateName)

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Medical Directors', href: MEDICAL_DIRECTORS_PATH },
    { name: stateName, href: `${MEDICAL_DIRECTORS_PATH}/${stateSlug}` },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Medical Directors in {stateName}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Browse Medical Directors licensed in {stateName}. Compare specialties, board
          certifications, oversight format, and monthly fees to find the right physician for your
          med spa, clinic, or practice.
        </p>
        {meta.totalCount > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {meta.totalCount} Medical Director{meta.totalCount !== 1 ? 's' : ''} found in{' '}
            {stateName}
          </p>
        )}
      </header>

      {/* Medical Director grid */}
      {supervisors.length === 0 ? (
        <EmptyState stateName={stateName} />
      ) : (
        <>
          <section aria-labelledby="medical-directors-heading">
            <h2 id="medical-directors-heading" className="sr-only">
              Medical Directors in {stateName}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supervisors.map((supervisor) => (
                <SupervisorCard key={supervisor.id} supervisor={supervisor} stateSlug={stateSlug} />
              ))}
            </div>
          </section>

          <PublicResultsCta
            role="medicalDirector"
            totalCount={meta.totalCount}
            shownCount={supervisors.length}
            context={`in ${stateName}`}
          />
        </>
      )}

      {/* What to look for section */}
      <section aria-labelledby="guide-heading" className="mt-12 rounded-xl bg-muted/40 p-6">
        <h2 id="guide-heading" className="text-xl font-bold text-foreground">
          What to Look for in a Medical Director in {stateName}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {MEDICAL_DIRECTOR_TIPS.map((tip) => (
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
      <FaqSection faqs={faqs} heading={`${stateName} Medical Director FAQs`} />

      {/* Related state links */}
      <section aria-labelledby="related-heading" className="mt-12">
        <h2 id="related-heading" className="text-lg font-semibold text-foreground">
          Find Medical Directors in Other States
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOP_STATE_SLUGS.filter((s) => s !== stateSlug)
            .slice(0, 12)
            .map((slug) => (
              <Link
                key={slug}
                href={`${MEDICAL_DIRECTORS_PATH}/${slug}`}
                className="rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {stateSlugToDisplayName(slug)}
              </Link>
            ))}
        </div>
      </section>

      <div className="mt-8">
        <Link
          href={`/supervisors/${stateSlug}`}
          className="text-sm font-medium text-primary transition-colors hover:underline"
        >
          Looking for a Supervisor or Collaborating Physician in {stateName}? →
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({ stateName }: { stateName: string }) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium text-foreground">No Medical Directors found in {stateName} yet.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        New Medical Directors join regularly. Create a free account to get matched when one licensed
        in {stateName} joins.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/signup?type=need-medical-director"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Free Account
        </Link>
        <Link
          href={MEDICAL_DIRECTORS_PATH}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
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

const MEDICAL_DIRECTOR_TIPS = [
  {
    title: 'State Licensure',
    body: 'Confirm the Medical Director holds an active medical license in the state where your services are delivered.',
  },
  {
    title: 'Relevant Specialty',
    body: 'Look for board certification or experience that fits your services, such as dermatology for aesthetics or emergency medicine for IV therapy.',
  },
  {
    title: 'Scope of Oversight',
    body: 'Agree on which services, protocols, and standing orders they will approve, and how delegation to your staff will work.',
  },
  {
    title: 'Chart Review & Availability',
    body: 'Clarify how often they will review charts, how quickly they respond to urgent questions, and whether on-site visits are included.',
  },
  {
    title: 'Format',
    body: 'Decide whether you need in-person, virtual, or hybrid oversight, and confirm the format meets your state’s requirements.',
  },
  {
    title: 'Fees and Agreement Terms',
    body: 'Compare monthly fees and review liability coverage, renewal, and termination terms before signing an agreement.',
  },
]
