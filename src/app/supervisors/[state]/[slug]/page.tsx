/**
 * Unified dynamic route for /supervisors/[state]/[slug]
 *
 * Handles three distinct page types at build/request time:
 *
 *  1. License-type pages  — slug is a known license slug (e.g. "lcsw")
 *     URL: /supervisors/texas/lcsw
 *
 *  2. Supervisor-type pSEO pages — slug is a known supervisor type slug
 *     URL: /supervisors/texas/collaborating-physicians
 *     URL: /supervisors/texas/supervising-physicians
 *     URL: /supervisors/texas/mental-health-counselor-supervisors
 *
 *  3. Supervisor profile pages — slug is a UUID (e.g. "46e0579d-...")
 *     URL: /supervisors/california/46e0579d-ec2f-4893-8277-7e4e6220757d
 *
 * Detection priority: UUID → supervisor-type slug → license slug → 404
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FaqSection } from '@/components/seo/FaqSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import type { PublicSupervisorSummary } from '@/lib/api/public-supervisors'
import { fetchPublicSupervisorById, fetchPublicSupervisors } from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { getLicenseFaqs, getSupervisorTypeFaqs } from '@/lib/seo/faq-data'
import { generateSupervisorJsonLd } from '@/lib/seo/jsonld'
import {
  isUUID,
  isValidLicenseSlug,
  isValidStateSlug,
  isValidSupervisorTypeSlug,
  LICENSE_TYPE_SLUGS,
  licenseSlugToLabel,
  stateAbbreviationToDisplayName,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  SUPERVISOR_TYPE_PAGE_SLUG_MAP,
  TOP_LICENSE_SLUGS_FOR_STATE,
  US_STATES,
} from '@/lib/seo/routes'

const MIN_SUPERVISORS_TO_INDEX = 3

// ---------------------------------------------------------------------------
// Helpers for type-aware metadata copy
// ---------------------------------------------------------------------------

/** Builds a human-readable label for a supervisor based on their type and license. */
function buildSupervisorTypeLabel(
  supervisorType?: string | null,
  licenseType?: string | null,
): string {
  if (supervisorType === 'Collaborating Physician') return 'Collaborating Physician'
  if (supervisorType === 'Supervising Physician') return 'Supervising Physician'
  return [licenseType, 'Supervisor'].filter(Boolean).join(' ') || 'Supervisor'
}

/** Builds a page title for a supervisor-type pSEO page. */
function buildSupervisorTypePageTitle(typeSlug: string, stateName: string): string {
  if (typeSlug === 'collaborating-physicians')
    return `Collaborating Physicians in ${stateName} | Find A Supervisor`
  if (typeSlug === 'supervising-physicians')
    return `Supervising Physicians in ${stateName} | Find A Supervisor`
  return `Mental Health Counselor Supervisors in ${stateName} | Find A Supervisor`
}

/** Builds a meta description for a supervisor-type pSEO page. */
function buildSupervisorTypePageDescription(typeSlug: string, stateName: string): string {
  if (typeSlug === 'collaborating-physicians') {
    return `Find collaborating physicians in ${stateName}. Browse verified collaborating physicians by specialty, availability, and format. Ideal for nurse practitioners seeking physician collaboration agreements.`
  }
  if (typeSlug === 'supervising-physicians') {
    return `Find supervising physicians in ${stateName}. Browse verified supervising physicians by specialty, availability, and format. Ideal for physician assistants seeking physician supervision.`
  }
  return `Find mental health counselor supervisors in ${stateName}. Browse licensed supervisors for LCSWs, LMFTs, LPCs, LMHCs, and other mental health professionals by specialty and supervision format.`
}

interface Props {
  params: Promise<{ state: string; slug: string }>
}

// ---------------------------------------------------------------------------
// Static params — only pre-generate license-type pages at build time.
// Supervisor profile pages (UUIDs) are rendered on-demand via ISR.
// dynamicParams = true (the default) ensures unknown slugs (e.g. new supervisor
// UUIDs added after the build) are still served — not returned as 404.
// ---------------------------------------------------------------------------

export const dynamicParams = true

export function generateStaticParams() {
  const states = Object.keys(US_STATES)
  return states.flatMap((state) => TOP_LICENSE_SLUGS_FOR_STATE.map((slug) => ({ state, slug })))
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, slug } = await params

  if (!isValidStateSlug(stateSlug)) {
    return { robots: { index: false, follow: true } }
  }

  const stateName = stateSlugToDisplayName(stateSlug)

  // Supervisor profile page — try to fetch real data for rich metadata
  if (isUUID(slug)) {
    const supervisor = await fetchPublicSupervisorById(slug)

    if (supervisor) {
      const typeLabel = buildSupervisorTypeLabel(supervisor.supervisorType, supervisor.licenseType)
      const isPhysicianType =
        supervisor.supervisorType === 'Collaborating Physician' ||
        supervisor.supervisorType === 'Supervising Physician'
      return buildMetadata({
        title: `${supervisor.fullName} — ${typeLabel} in ${stateName} | ${SITE_NAME}`,
        description: isPhysicianType
          ? `View ${supervisor.fullName}'s ${typeLabel} profile, specialties, location, availability, format, and professional background.`
          : `View ${supervisor.fullName}'s supervision profile — license type, specialties, experience, and availability in ${stateName}. Connect with verified supervisors on ${SITE_NAME}.`,
        path: `/supervisors/${stateSlug}/${slug}`,
        ogImage: supervisor.profilePhotoUrl ?? undefined,
      })
    }

    return buildMetadata({
      title: `Supervisor Profile | ${stateName} | ${SITE_NAME}`,
      description: `View this supervisor's credentials, specialties, and availability in ${stateName} on ${SITE_NAME}.`,
      path: `/supervisors/${stateSlug}/${slug}`,
    })
  }

  // Supervisor-type pSEO page (e.g. /supervisors/texas/collaborating-physicians)
  if (isValidSupervisorTypeSlug(slug)) {
    const typePageTitle = buildSupervisorTypePageTitle(slug, stateName)
    const typePageDesc = buildSupervisorTypePageDescription(slug, stateName)

    const { supervisors } = await fetchPublicSupervisors({
      stateOfLicensure: stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase(),
      stateFullName: stateName,
      limit: MIN_SUPERVISORS_TO_INDEX,
    })

    if (supervisors.length < MIN_SUPERVISORS_TO_INDEX) {
      return { robots: { index: false, follow: true } }
    }

    return buildMetadata({
      title: typePageTitle,
      description: typePageDesc,
      path: `/supervisors/${stateSlug}/${slug}`,
      og: { type: 'website' },
    })
  }

  // License-type page
  if (isValidLicenseSlug(slug)) {
    const licenseLabel = licenseSlugToLabel(slug)

    const { supervisors } = await fetchPublicSupervisors({
      stateOfLicensure: stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase(),
      stateFullName: stateName,
      licenseType: licenseLabel,
      limit: MIN_SUPERVISORS_TO_INDEX,
    })

    if (supervisors.length < MIN_SUPERVISORS_TO_INDEX) {
      return { robots: { index: false, follow: true } }
    }

    return buildMetadata({
      title: `${licenseLabel} Supervisors in ${stateName}`,
      description: `Find ${licenseLabel} supervisors in ${stateName}. Browse verified ${licenseLabel} supervisors by specialty and supervision format. Connect with the right supervisor for your licensure on ${SITE_NAME}.`,
      path: `/supervisors/${stateSlug}/${slug}`,
    })
  }

  return { robots: { index: false, follow: true } }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StateSlugPage({ params }: Props) {
  const { state: stateSlug, slug } = await params

  if (!isValidStateSlug(stateSlug)) notFound()

  if (isUUID(slug)) {
    return <SupervisorProfileView stateSlug={stateSlug} supervisorId={slug} />
  }

  if (isValidSupervisorTypeSlug(slug)) {
    return <SupervisorTypeView stateSlug={stateSlug} typeSlug={slug} />
  }

  if (isValidLicenseSlug(slug)) {
    return <LicenseTypeView stateSlug={stateSlug} licenseSlug={slug} />
  }

  notFound()
}

// ---------------------------------------------------------------------------
// License-type view
// ---------------------------------------------------------------------------

async function LicenseTypeView({
  stateSlug,
  licenseSlug,
}: {
  stateSlug: string
  licenseSlug: string
}) {
  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()
  const licenseLabel = licenseSlugToLabel(licenseSlug)

  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    licenseType: licenseLabel,
    limit: 20,
  })

  const faqs = getLicenseFaqs(licenseLabel, stateName)
  const shouldIndex = supervisors.length >= MIN_SUPERVISORS_TO_INDEX

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Supervisors', href: '/supervisors' },
    { name: stateName, href: `/supervisors/${stateSlug}` },
    { name: licenseLabel, href: `/supervisors/${stateSlug}/${licenseSlug}` },
  ]

  return (
    <>
      {!shouldIndex && <meta name="robots" content="noindex, follow" />}

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {licenseLabel} Supervisors in {stateName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Browse licensed {licenseLabel} supervisors in {stateName}. Find experienced supervisors
            who can support your path to {licenseLabel} licensure.
          </p>
          {meta.totalCount > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {meta.totalCount} {licenseLabel} supervisor{meta.totalCount !== 1 ? 's' : ''} found in{' '}
              {stateName}
            </p>
          )}
        </header>

        {/* Other license types */}
        <nav aria-label="Browse other license types" className="mb-8">
          <p className="mb-2 text-sm font-medium text-foreground">
            Other License Types in {stateName}
          </p>
          <div className="flex flex-wrap gap-2">
            {TOP_LICENSE_SLUGS_FOR_STATE.filter((s) => s !== licenseSlug).map((s) => (
              <Link
                key={s}
                href={`/supervisors/${stateSlug}/${s}`}
                className="rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {licenseSlugToLabel(s)}
              </Link>
            ))}
          </div>
        </nav>

        {supervisors.length === 0 ? (
          <LicenseEmptyState
            stateName={stateName}
            licenseLabel={licenseLabel}
            stateSlug={stateSlug}
          />
        ) : (
          <>
            <section aria-labelledby="supervisors-heading">
              <h2 id="supervisors-heading" className="sr-only">
                {licenseLabel} Supervisors in {stateName}
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

            {meta.totalCount > supervisors.length && (
              <div className="mt-8 text-center">
                <Link
                  href="/login?redirect=/find-supervisors"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign in to see all {meta.totalCount} supervisors
                </Link>
              </div>
            )}
          </>
        )}

        <section aria-labelledby="about-heading" className="mt-12 rounded-xl bg-muted/40 p-6">
          <h2 id="about-heading" className="text-xl font-bold text-foreground">
            About {licenseLabel} Supervision in {stateName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {licenseLabel} (
            {Object.entries(LICENSE_TYPE_SLUGS).find(([, v]) => v === licenseLabel)?.[0] ??
              licenseSlug}
            ) is a clinical license that requires supervised practice hours under an approved
            supervisor. Requirements in {stateName} are set by the state licensing board and include
            the total number of hours, supervisor qualifications, and documentation standards. Using{' '}
            {SITE_NAME}, you can filter by license type and state to find {licenseLabel} supervisors
            who are currently accepting supervisees in {stateName}.
          </p>
        </section>

        <FaqSection faqs={faqs} heading={`${licenseLabel} Supervision FAQs — ${stateName}`} />

        <section aria-labelledby="related-heading" className="mt-12">
          <h2 id="related-heading" className="text-lg font-semibold text-foreground">
            {licenseLabel} Supervisors in Other States
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_STATES.filter((s) => s.slug !== stateSlug).map(({ label, slug: s }) => (
              <Link
                key={s}
                href={`/supervisors/${s}/${licenseSlug}`}
                className="rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {licenseLabel} in {label}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <Link
            href={`/supervisors/${stateSlug}`}
            className="text-sm font-medium text-primary transition-colors hover:underline"
          >
            ← All supervisors in {stateName}
          </Link>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Supervisor-type pSEO view
// ---------------------------------------------------------------------------

async function SupervisorTypeView({
  stateSlug,
  typeSlug,
}: {
  stateSlug: string
  typeSlug: string
}) {
  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()
  const typeName =
    SUPERVISOR_TYPE_PAGE_SLUG_MAP[typeSlug as keyof typeof SUPERVISOR_TYPE_PAGE_SLUG_MAP] ??
    typeSlug

  const { supervisors, meta } = await fetchPublicSupervisors({
    stateOfLicensure: stateAbbreviation,
    stateFullName: stateName,
    limit: 20,
  })

  const faqs = getSupervisorTypeFaqs(typeSlug, stateName)
  const shouldIndex = supervisors.length >= MIN_SUPERVISORS_TO_INDEX

  const heading = buildSupervisorTypePageTitle(typeSlug, stateName).split(' | ')[0]

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Supervisors', href: '/supervisors' },
    { name: stateName, href: `/supervisors/${stateSlug}` },
    { name: typeName, href: `/supervisors/${stateSlug}/${typeSlug}` },
  ]

  const aboutText = (() => {
    if (typeSlug === 'collaborating-physicians') {
      return `Collaborating physicians partner with nurse practitioners and other advanced practice providers to fulfill state-mandated collaboration requirements. ${stateName} state regulations define the scope and structure of collaboration agreements. Use ${SITE_NAME} to find collaborating physicians currently accepting new collaborative partners in ${stateName}.`
    }
    if (typeSlug === 'supervising-physicians') {
      return `Supervising physicians work with physician assistants to meet state-mandated supervision requirements. The ${stateName} licensing board sets the standards for supervisory relationships between PAs and physicians. Use ${SITE_NAME} to find supervising physicians currently accepting new supervisees in ${stateName}.`
    }
    return `Mental health counselor supervisors provide the clinical oversight required for LCSWs, LMFTs, LPCs, LMHCs, and other mental health professionals to advance toward full licensure. ${stateName}'s state licensing board defines the required supervision hours, supervisor qualifications, and documentation standards.`
  })()

  return (
    <>
      {!shouldIndex && <meta name="robots" content="noindex, follow" />}

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {buildSupervisorTypePageDescription(typeSlug, stateName)}
          </p>
          {meta.totalCount > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {meta.totalCount} result{meta.totalCount !== 1 ? 's' : ''} found in {stateName}
            </p>
          )}
        </header>

        <nav aria-label="Browse other supervisor types" className="mb-8">
          <p className="mb-2 text-sm font-medium text-foreground">Other Supervisor Types</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUPERVISOR_TYPE_PAGE_SLUG_MAP)
              .filter(([s]) => s !== typeSlug)
              .map(([s, label]) => (
                <Link
                  key={s}
                  href={`/supervisors/${stateSlug}/${s}`}
                  className="rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {label} in {stateName}
                </Link>
              ))}
          </div>
        </nav>

        {supervisors.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium text-foreground">No results found in {stateName} yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              New supervisors and physicians join regularly. Try browsing all supervisor types in
              this state.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/supervisors/${stateSlug}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                All supervisors in {stateName}
              </Link>
              <Link
                href="/supervisors"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
              >
                Browse all states
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section aria-labelledby="type-supervisors-heading">
              <h2 id="type-supervisors-heading" className="sr-only">
                {heading}
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

            {meta.totalCount > supervisors.length && (
              <div className="mt-8 text-center">
                <Link
                  href="/login?redirect=/find-supervisors"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign in to see all {meta.totalCount} results
                </Link>
              </div>
            )}
          </>
        )}

        <section aria-labelledby="about-type-heading" className="mt-12 rounded-xl bg-muted/40 p-6">
          <h2 id="about-type-heading" className="text-xl font-bold text-foreground">
            About {typeName} in {stateName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{aboutText}</p>
        </section>

        <FaqSection faqs={faqs} heading={`${typeName} FAQs — ${stateName}`} />

        <section aria-labelledby="related-states-heading" className="mt-12">
          <h2 id="related-states-heading" className="text-lg font-semibold text-foreground">
            {typeName} in Other States
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_STATES.filter((s) => s.slug !== stateSlug).map(({ label, slug: s }) => (
              <Link
                key={s}
                href={`/supervisors/${s}/${typeSlug}`}
                className="rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {typeName} in {label}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <Link
            href={`/supervisors/${stateSlug}`}
            className="text-sm font-medium text-primary transition-colors hover:underline"
          >
            ← All supervisors in {stateName}
          </Link>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Supervisor profile view
// ---------------------------------------------------------------------------

async function SupervisorProfileView({
  stateSlug,
  supervisorId,
}: {
  stateSlug: string
  supervisorId: string
}) {
  const stateName = stateSlugToDisplayName(stateSlug)
  const stateAbbreviation = stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase()
  const supervisor = await fetchPublicSupervisorById(supervisorId)

  const jsonLd = generateSupervisorJsonLd({
    id: supervisorId,
    fullName: supervisor?.fullName ?? 'Supervisor',
    state: stateAbbreviation,
    city: supervisor?.city ?? null,
    licenseType: supervisor?.licenseType ?? null,
    supervisorType: supervisor?.supervisorType ?? null,
    bio: supervisor?.bio ?? null,
    profilePhotoUrl: supervisor?.profilePhotoUrl ?? null,
  })

  const breadcrumbName = supervisor?.fullName ?? 'Supervisor Profile'
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Supervisors', href: '/supervisors' },
    { name: stateName, href: `/supervisors/${stateSlug}` },
    { name: breadcrumbName, href: `/supervisors/${stateSlug}/${supervisorId}` },
  ]

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {supervisor ? (
          <SupervisorPublicProfile
            supervisor={supervisor}
            stateSlug={stateSlug}
            stateName={stateName}
            supervisorId={supervisorId}
          />
        ) : (
          <ProfileNotFound
            stateSlug={stateSlug}
            stateName={stateName}
            supervisorId={supervisorId}
          />
        )}

        <div className="mt-10 border-t pt-8">
          <p className="text-sm font-semibold text-foreground">Find Supervisors in Other States</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_STATES.filter((s) => s.slug !== stateSlug)
              .slice(0, 8)
              .map(({ label, slug }) => (
                <Link
                  key={slug}
                  href={`/supervisors/${slug}`}
                  className="rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {label}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Rich profile card (supervisor found in search)
// ---------------------------------------------------------------------------

function SupervisorPublicProfile({
  supervisor,
  supervisorId,
}: {
  supervisor: PublicSupervisorSummary
  stateSlug: string
  stateName: string
  supervisorId: string
}) {
  const location = [supervisor.city, supervisor.state].filter(Boolean).join(', ')
  const tags = [
    supervisor.licenseType,
    supervisor.supervisorType,
    supervisor.supervisionFormat,
  ].filter(Boolean)

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Hero */}
      <div className="flex flex-col gap-5 border-b p-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        {supervisor.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supervisor.profilePhotoUrl}
            alt={`${supervisor.fullName} profile photo`}
            className="size-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#E2F0E8] text-2xl font-semibold text-[#006D36]"
            aria-hidden="true"
          >
            {initials(supervisor.fullName)}
          </div>
        )}

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground">{supervisor.fullName}</h1>
          {location && <p className="mt-0.5 text-sm text-muted-foreground">{location}</p>}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {supervisor.acceptingSupervisees && (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
                Accepting supervisees
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {supervisor.yearsOfExperience && (
          <ProfileDetail label="Years of Experience" value={supervisor.yearsOfExperience} />
        )}
        {supervisor.licenseType && (
          <ProfileDetail label="License Type" value={supervisor.licenseType} />
        )}
        {supervisor.supervisionFormat && (
          <ProfileDetail
            label="Supervision Format"
            value={formatEnum(supervisor.supervisionFormat)}
          />
        )}
        {supervisor.specialty && <ProfileDetail label="Specialty" value={supervisor.specialty} />}
      </div>

      {/* Bio — professionalSummary if set, otherwise describeYourself */}
      {supervisor.bio && (
        <div className="border-t px-6 pb-6 pt-4">
          <p className="text-sm font-semibold text-foreground">About</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{supervisor.bio}</p>
        </div>
      )}

      {/* Licensed in */}
      {supervisor.stateOfLicensure.length > 0 && (
        <div className="border-t bg-[#F0F7F3] px-6 py-5">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4 shrink-0 text-[#006D36]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-sm font-semibold text-[#006D36]">
              Licensed in {supervisor.stateOfLicensure.length} state
              {supervisor.stateOfLicensure.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {supervisor.stateOfLicensure.map((s) => (
              <span
                key={s}
                className="rounded-md border border-[#006D36]/20 bg-white px-3 py-1 text-sm font-semibold text-[#006D36]"
              >
                {stateAbbreviationToDisplayName(s)}{' '}
                <span className="font-normal opacity-70">({s.toUpperCase()})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {supervisor.certification.length > 0 && (
        <div className="border-t px-6 pb-6 pt-4">
          <p className="text-sm font-semibold text-foreground">Certifications & Approaches</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {supervisor.certification.map((c) => (
              <span
                key={c}
                className="rounded-md border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {formatCertification(c)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA — sign-in required only to contact or hire */}
      <div className="border-t bg-muted/30 px-6 py-5">
        <p className="text-sm text-muted-foreground">
          Ready to connect? Sign in or create a free account to contact {supervisor.fullName} and
          send a hire request.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/login?redirect=/find-supervisors/${supervisorId}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in to connect
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function formatEnum(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const KNOWN_ACRONYMS = new Set([
  'ACT',
  'CBT',
  'DBT',
  'EMDR',
  'EFT',
  'IFS',
  'REBT',
  'SFBT',
  'CPT',
  'PE',
  'MBSR',
  'MBCT',
  'ABA',
  'CRT',
  'TF',
  'PCIT',
  'MI',
  'AEDP',
  'ISTDP',
  'RET',
  'CSAT',
  'NLP',
])

function formatCertification(value: string): string {
  return value
    .split('_')
    .map((word) =>
      KNOWN_ACRONYMS.has(word.toUpperCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ')
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ---------------------------------------------------------------------------
// Profile not found fallback
// ---------------------------------------------------------------------------

function ProfileNotFound({
  stateSlug,
  stateName,
}: {
  stateSlug: string
  stateName: string
  supervisorId: string
}) {
  return (
    <div className="rounded-2xl border border-dashed p-12 text-center">
      <h1 className="text-2xl font-bold text-foreground">Supervisor Not Found</h1>
      <p className="mt-3 text-muted-foreground">
        This supervisor profile could not be found or may have been removed. Browse other
        supervisors in {stateName} to find the right match.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/supervisors/${stateSlug}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse supervisors in {stateName}
        </Link>
        <Link
          href="/supervisors"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Browse all states
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function LicenseEmptyState({
  stateName,
  licenseLabel,
  stateSlug,
}: {
  stateName: string
  licenseLabel: string
  stateSlug: string
}) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium text-foreground">
        No {licenseLabel} supervisors found in {stateName} yet.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        New supervisors join regularly. Try browsing all supervisors in this state.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/supervisors/${stateSlug}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          All supervisors in {stateName}
        </Link>
        <Link
          href="/supervisors"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          Browse all states
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const POPULAR_STATES = [
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
]
