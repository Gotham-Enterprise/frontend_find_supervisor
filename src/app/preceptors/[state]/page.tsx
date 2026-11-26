/**
 * pSEO state landing page — /preceptors/[state]
 * e.g. /preceptors/texas → "Preceptors in Texas"
 *
 * Targets keywords like:
 *   - "NP preceptor in Texas"
 *   - "find a preceptor California"
 *   - "clinical rotation preceptor Florida"
 *
 * This is a fully public Server Component. Data comes from the unauthenticated
 * /supervision/search endpoint scoped to primary Preceptors.
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
import { getPreceptorStateFaqs } from '@/lib/seo/faq-data'
import {
  isValidStateSlug,
  PRECEPTOR_DISCIPLINE_SLUG_MAP,
  PRECEPTORS_PATH,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  TOP_STATE_SLUGS,
  US_STATES,
} from '@/lib/seo/routes'

/** Controls whether the page is indexed based on Preceptor count. */
const MIN_PRECEPTORS_TO_INDEX = 3

interface Props {
  params: Promise<{ state: string }>
  searchParams: Promise<{ discipline?: string }>
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

  // Check Preceptor count to decide indexability — avoids thin-page indexing
  const { supervisors } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    searchMode: 'preceptors',
    limit: MIN_PRECEPTORS_TO_INDEX,
  })

  // Thin pages keep their real title/description but stay out of the index.
  return buildMetadata({
    noIndex: supervisors.length < MIN_PRECEPTORS_TO_INDEX,
    title: `Preceptors in ${stateName}`,
    description: `Find verified preceptors licensed in ${stateName} for NP, PA, PT, PTA, dental hygiene, dental assistant, COTA, SLP, and pharmacy student rotations. Compare discipline, specialty focus, format, and fees on ${SITE_NAME}.`,
    path: `${PRECEPTORS_PATH}/${stateSlug}`,
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StatePreceptorsPage({ params, searchParams }: Props) {
  const { state: stateSlug } = await params
  const { discipline: rawDiscipline } = await searchParams

  if (!isValidStateSlug(stateSlug)) {
    notFound()
  }

  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()
  // Unknown discipline values are ignored (never echoed into the heading).
  const discipline =
    rawDiscipline && PRECEPTOR_DISCIPLINE_SLUG_MAP[rawDiscipline.toLowerCase()]
      ? rawDiscipline.toLowerCase()
      : undefined
  const disciplineName = discipline ? PRECEPTOR_DISCIPLINE_SLUG_MAP[discipline] : undefined

  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    supervisorOccupation: disciplineName,
    searchMode: 'preceptors',
    limit: 20,
  })

  const faqs = getPreceptorStateFaqs(stateName)

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Preceptors', href: PRECEPTORS_PATH },
    { name: stateName, href: `${PRECEPTORS_PATH}/${stateSlug}` },
  ]

  const heading = disciplineName
    ? `${disciplineName} Preceptors in ${stateName}`
    : `Preceptors in ${stateName}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{heading}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Browse preceptors licensed in {stateName} who host students for program-required clinical
          and field hours. Compare discipline, specialty focus, format, and fees to find the right
          placement for your rotation.
        </p>
        {meta.totalCount > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {meta.totalCount} Preceptor{meta.totalCount !== 1 ? 's' : ''} found in {stateName}
          </p>
        )}
      </header>

      {/* Discipline chips */}
      <nav aria-label="Browse by discipline" className="mb-6">
        <p className="mb-2 text-sm font-medium text-foreground">Browse by Discipline</p>
        <div className="flex flex-wrap gap-2">
          <DisciplineChip
            href={`${PRECEPTORS_PATH}/${stateSlug}`}
            label="All Disciplines"
            active={!discipline}
          />
          {Object.entries(PRECEPTOR_DISCIPLINE_SLUG_MAP).map(([slug, name]) => (
            <DisciplineChip
              key={slug}
              href={`${PRECEPTORS_PATH}/${stateSlug}?discipline=${slug}`}
              label={name}
              active={discipline === slug}
            />
          ))}
        </div>
      </nav>

      {/* Preceptor grid */}
      {supervisors.length === 0 ? (
        <EmptyState stateName={stateName} disciplineName={disciplineName} />
      ) : (
        <>
          <section aria-labelledby="preceptors-heading">
            <h2 id="preceptors-heading" className="sr-only">
              {heading}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supervisors.map((supervisor) => (
                <SupervisorCard key={supervisor.id} supervisor={supervisor} stateSlug={stateSlug} />
              ))}
            </div>
          </section>

          <PublicResultsCta
            role="preceptor"
            totalCount={meta.totalCount}
            shownCount={supervisors.length}
            context={`in ${stateName}`}
          />
        </>
      )}

      {/* What to look for section */}
      <section aria-labelledby="guide-heading" className="mt-12 rounded-xl bg-muted/40 p-6">
        <h2 id="guide-heading" className="text-xl font-bold text-foreground">
          What to Look for in a Preceptor in {stateName}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {PRECEPTOR_TIPS.map((tip) => (
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
      <FaqSection faqs={faqs} heading={`${stateName} Preceptor FAQs`} />

      {/* Related state links */}
      <section aria-labelledby="related-heading" className="mt-12">
        <h2 id="related-heading" className="text-lg font-semibold text-foreground">
          Find Preceptors in Other States
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOP_STATE_SLUGS.filter((s) => s !== stateSlug)
            .slice(0, 12)
            .map((slug) => (
              <Link
                key={slug}
                href={`${PRECEPTORS_PATH}/${slug}`}
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
          Already licensed and looking for a Supervisor in {stateName}? →
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DisciplineChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? 'rounded-full border border-primary bg-primary/10 px-3 py-1 text-sm font-medium text-primary'
          : 'rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary'
      }
    >
      {label}
    </Link>
  )
}

function EmptyState({ stateName, disciplineName }: { stateName: string; disciplineName?: string }) {
  const noun = disciplineName ? `${disciplineName} Preceptors` : 'Preceptors'
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium text-foreground">
        No {noun} found in {stateName} yet.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        New Preceptors join regularly. Create a free student account to get matched when one
        licensed in {stateName} joins.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/signup?type=preceptee"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Free Student Account
        </Link>
        <Link
          href={PRECEPTORS_PATH}
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

const PRECEPTOR_TIPS = [
  {
    title: 'State Licensure',
    body: 'Confirm the preceptor holds an active license in the state where your rotation takes place.',
  },
  {
    title: 'Matching Discipline',
    body: 'Your program decides who may precept you, for example an NP or physician for NP students, or a dentist for dental hygiene students.',
  },
  {
    title: 'Program Approval',
    body: 'Most schools require an affiliation agreement with the site and approval of the preceptor before hours count. Start the paperwork early.',
  },
  {
    title: 'Rotation Fit',
    body: 'Match the practice setting and specialty focus to the rotation your program requires, such as primary care, pediatrics, or acute care.',
  },
  {
    title: 'Hours and Schedule',
    body: 'Agree on start and end dates, weekly hours, and how completed hours and evaluations will be documented.',
  },
  {
    title: 'Fees and Expectations',
    body: 'Review any fee, what it covers, and expectations around attendance, preparation, and feedback before you commit.',
  },
]
