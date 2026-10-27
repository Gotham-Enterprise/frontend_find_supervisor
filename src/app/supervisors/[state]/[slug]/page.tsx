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
 *     Primary Medical Directors permanently redirect to /medical-directors/[state]/[id].
 *
 * Legacy /supervisors/[state]/medical-directors permanently redirects to
 * /medical-directors/[state] (Medical Directors have their own directory).
 *
 * Detection priority: UUID → supervisor-type slug → license slug → 404
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { FaqSection } from '@/components/seo/FaqSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { PublicResultsCta } from '@/components/seo/PublicResultsCta'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { SupervisorPublicProfile } from '@/components/seo/SupervisorPublicProfile'
import { SupervisionFormatGuide } from '@/components/SupervisionFormatGuide'
import {
  fetchPublicSupervisorById,
  fetchPublicSupervisors,
  isPublicMedicalDirector,
} from '@/lib/api/public-supervisors'
import {
  MENTAL_HEALTH_PROFESSIONS,
  type ProfessionGroup,
} from '@/lib/constants/state-supervision-rules'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { getLicenseFaqs, getSupervisorTypeFaqs } from '@/lib/seo/faq-data'
import { generateSupervisorJsonLd } from '@/lib/seo/jsonld'
import {
  isUUID,
  isValidLicenseSlug,
  isValidStateSlug,
  isValidSupervisorTypeSlug,
  LEGACY_MEDICAL_DIRECTOR_TYPE_PAGE_SLUG,
  LICENSE_TYPE_SLUGS,
  licenseSlugToLabel,
  MEDICAL_DIRECTORS_PATH,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  SUPERVISOR_TYPE_PAGE_SLUG_MAP,
  TOP_LICENSE_SLUGS_FOR_STATE,
  US_STATES,
} from '@/lib/seo/routes'
import { isPhysicianSupervisorType } from '@/lib/utils/supervisor-type'

const MIN_SUPERVISORS_TO_INDEX = 3

/** Format-guide professions per supervisor-type page. */
const TYPE_PAGE_PROFESSIONS: Record<string, ProfessionGroup[]> = {
  'mental-health-counselor-supervisors': MENTAL_HEALTH_PROFESSIONS,
  'collaborating-physicians': ['NP'],
  'supervising-physicians': ['PA'],
}

// ---------------------------------------------------------------------------
// Helpers for type-aware metadata copy
// ---------------------------------------------------------------------------

/** Builds a human-readable label for a supervisor based on their type and license. */
function buildSupervisorTypeLabel(
  supervisorType?: string | null,
  licenseType?: string | null,
): string {
  if (supervisorType && isPhysicianSupervisorType(supervisorType)) return supervisorType
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
    return `Find Collaborating Physicians in ${stateName}. Browse verified Collaborating Physicians by specialty, availability, and format. Ideal for nurse practitioners seeking physician collaboration agreements.`
  }
  if (typeSlug === 'supervising-physicians') {
    return `Find Supervising Physicians in ${stateName}. Browse verified Supervising Physicians by specialty, availability, and format. Ideal for physician assistants seeking physician supervision.`
  }
  return `Find Mental Health Counselor Supervisors in ${stateName}. Browse Licensed Supervisors for LCSWs, LMFTs, LPCs, LMHCs, and other mental health professionals by specialty and supervision format.`
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

  if (slug === LEGACY_MEDICAL_DIRECTOR_TYPE_PAGE_SLUG) {
    permanentRedirect(`${MEDICAL_DIRECTORS_PATH}/${stateSlug}`)
  }

  const stateName = stateSlugToDisplayName(stateSlug)

  // Supervisor profile page — try to fetch real data for rich metadata
  if (isUUID(slug)) {
    const supervisor = await fetchPublicSupervisorById(slug)

    // Primary Medical Directors are canonical under /medical-directors.
    if (supervisor && isPublicMedicalDirector(supervisor)) {
      permanentRedirect(`${MEDICAL_DIRECTORS_PATH}/${stateSlug}/${slug}`)
    }

    if (supervisor) {
      const typeLabel = buildSupervisorTypeLabel(supervisor.supervisorType, supervisor.licenseType)
      const isPhysicianType = isPhysicianSupervisorType(supervisor.supervisorType ?? '')
      return buildMetadata({
        title: `${supervisor.fullName}, ${typeLabel} in ${stateName} | ${SITE_NAME}`,
        description: isPhysicianType
          ? `View ${supervisor.fullName}'s ${typeLabel} profile, specialties, location, availability, format, and professional background.`
          : `View ${supervisor.fullName}'s supervision profile, including license type, specialties, experience, and availability in ${stateName}. Connect with verified Supervisors on ${SITE_NAME}.`,
        path: `/supervisors/${stateSlug}/${slug}`,
        ogImage: supervisor.profilePhotoUrl ?? undefined,
      })
    }

    return buildMetadata({
      title: `Supervisor Profile | ${stateName} | ${SITE_NAME}`,
      description: `View this Supervisor's credentials, specialties, and availability in ${stateName} on ${SITE_NAME}.`,
      path: `/supervisors/${stateSlug}/${slug}`,
    })
  }

  // Supervisor-type pSEO page (e.g. /supervisors/texas/collaborating-physicians)
  if (isValidSupervisorTypeSlug(slug)) {
    const typePageTitle = buildSupervisorTypePageTitle(slug, stateName)
    const typePageDesc = buildSupervisorTypePageDescription(slug, stateName)

    // Count only this type — the indexing threshold must match what the page lists.
    const { supervisors } = await fetchPublicSupervisors({
      stateOfLicensure: stateSlugToAbbreviation(stateSlug) ?? stateSlug.toUpperCase(),
      stateFullName: stateName,
      supervisorType: SUPERVISOR_TYPE_PAGE_SLUG_MAP[slug],
      searchMode: 'supervisors',
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
      searchMode: 'supervisors',
      limit: MIN_SUPERVISORS_TO_INDEX,
    })

    if (supervisors.length < MIN_SUPERVISORS_TO_INDEX) {
      return { robots: { index: false, follow: true } }
    }

    return buildMetadata({
      title: `${licenseLabel} Supervisors in ${stateName}`,
      description: `Find ${licenseLabel} Supervisors in ${stateName}. Browse verified ${licenseLabel} Supervisors by specialty and supervision format. Connect with the right Supervisor for your licensure on ${SITE_NAME}.`,
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

  if (slug === LEGACY_MEDICAL_DIRECTOR_TYPE_PAGE_SLUG) {
    permanentRedirect(`${MEDICAL_DIRECTORS_PATH}/${stateSlug}`)
  }

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
    searchMode: 'supervisors',
    limit: 20,
  })

  const faqs = getLicenseFaqs(licenseLabel, stateName)

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Supervisors', href: '/supervisors' },
    { name: stateName, href: `/supervisors/${stateSlug}` },
    { name: licenseLabel, href: `/supervisors/${stateSlug}/${licenseSlug}` },
  ]

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {licenseLabel} Supervisors in {stateName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Browse licensed {licenseLabel} Supervisors in {stateName}. Find experienced Supervisors
            who can support your path to {licenseLabel} licensure.
          </p>
          {meta.totalCount > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {meta.totalCount} {licenseLabel} Supervisor{meta.totalCount !== 1 ? 's' : ''} found in{' '}
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

            <PublicResultsCta
              role="supervisor"
              totalCount={meta.totalCount}
              shownCount={supervisors.length}
              context={`in ${stateName}`}
            />
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
            Supervisor. Requirements in {stateName} are set by the state licensing board and include
            the total number of hours, Supervisor qualifications, and documentation standards. Using{' '}
            {SITE_NAME}, you can filter by license type and state to find {licenseLabel} Supervisors
            who are currently accepting supervisees in {stateName}.
          </p>
        </section>

        <FaqSection faqs={faqs} heading={`${stateName} ${licenseLabel} Supervision FAQs`} />

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
            ← All Supervisors in {stateName}
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
    supervisorType: typeName,
    searchMode: 'supervisors',
    limit: 20,
  })

  const faqs = getSupervisorTypeFaqs(typeSlug, stateName)

  const heading = buildSupervisorTypePageTitle(typeSlug, stateName).split(' | ')[0]

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Supervisors', href: '/supervisors' },
    { name: stateName, href: `/supervisors/${stateSlug}` },
    { name: typeName, href: `/supervisors/${stateSlug}/${typeSlug}` },
  ]

  const aboutText = (() => {
    if (typeSlug === 'collaborating-physicians') {
      return `Collaborating Physicians partner with nurse practitioners and other advanced practice providers to fulfill state-mandated collaboration requirements. ${stateName} state regulations define the scope and structure of collaboration agreements. Use ${SITE_NAME} to find Collaborating Physicians currently accepting new collaborative partners in ${stateName}.`
    }
    if (typeSlug === 'supervising-physicians') {
      return `Supervising Physicians work with physician assistants to meet state-mandated supervision requirements. The ${stateName} licensing board sets the standards for supervisory relationships between PAs and physicians. Use ${SITE_NAME} to find Supervising Physicians currently accepting new supervisees in ${stateName}.`
    }
    return `Mental Health Counselor Supervisors provide the clinical oversight required for LCSWs, LMFTs, LPCs, LMHCs, and other mental health professionals to advance toward full licensure. ${stateName}'s state licensing board defines the required supervision hours, Supervisor qualifications, and documentation standards.`
  })()

  return (
    <>
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

        {/* Each type page shows the format rules for its own supervisees. */}
        {TYPE_PAGE_PROFESSIONS[typeSlug] && (
          <div className="mb-8 empty:hidden">
            <SupervisionFormatGuide
              states={[{ code: stateAbbreviation, name: stateName }]}
              professions={TYPE_PAGE_PROFESSIONS[typeSlug]}
              hideWhenNoData
            />
          </div>
        )}

        <nav aria-label="Browse other Supervisor types" className="mb-8">
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
            <Link
              href={`${MEDICAL_DIRECTORS_PATH}/${stateSlug}`}
              className="rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Medical Directors in {stateName}
            </Link>
          </div>
        </nav>

        {supervisors.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium text-foreground">No results found in {stateName} yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              New Supervisors and physicians join regularly. Try browsing all Supervisor types in
              this state.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/supervisors/${stateSlug}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                All Supervisors in {stateName}
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

            <PublicResultsCta
              role="supervisor"
              totalCount={meta.totalCount}
              shownCount={supervisors.length}
              context={`in ${stateName}`}
            />
          </>
        )}

        <section aria-labelledby="about-type-heading" className="mt-12 rounded-xl bg-muted/40 p-6">
          <h2 id="about-type-heading" className="text-xl font-bold text-foreground">
            About {typeName} in {stateName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{aboutText}</p>
        </section>

        <FaqSection faqs={faqs} heading={`${stateName} ${typeName} FAQs`} />

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
            ← All Supervisors in {stateName}
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

  // Primary Medical Directors are canonical under /medical-directors.
  if (supervisor && isPublicMedicalDirector(supervisor)) {
    permanentRedirect(`${MEDICAL_DIRECTORS_PATH}/${stateSlug}/${supervisorId}`)
  }

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
            connectPath={`/find-supervisors/${supervisorId}`}
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
        This Supervisor profile could not be found or may have been removed. Browse other
        Supervisors in {stateName} to find the right match.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/supervisors/${stateSlug}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Supervisors in {stateName}
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
        No {licenseLabel} Supervisors found in {stateName} yet.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        New Supervisors join regularly. Try browsing all Supervisors in this state.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/supervisors/${stateSlug}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          All Supervisors in {stateName}
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
