/**
 * Public supervisee profile — /browse-supervisees/[state]/[id]
 * e.g. /browse-supervisees/california/860e5631-838d-4446-8821-a6ff179d57cd
 *
 * Reached from the "View Profile" button on the /browse-supervisees cards.
 * Mirrors the public supervisor profile (/supervisors/[state]/[id]) but is
 * never indexed: supervisees are pre-licensed professionals looking for help,
 * so their profiles stay off search engines and out of the sitemap.
 *
 * Data comes from the unauthenticated /supervision/supervisee/public-profile
 * endpoint — the name arrives masked and contact details are never included.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import type { PublicSuperviseeProfile } from '@/lib/api/public-supervisees'
import { fetchPublicSuperviseeById } from '@/lib/api/public-supervisees'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import {
  isUUID,
  isValidStateSlug,
  stateAbbreviationToDisplayName,
  stateSlugToDisplayName,
} from '@/lib/seo/routes'
import { formatPublicIdentity } from '@/lib/utils/identity-display'
import {
  formatAvailability,
  formatBudgetRange,
  formatHowSoonLooking,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'
import {
  isMedicalDirectorType,
  supervisionTypeDisplayLabel,
} from '@/lib/utils/supervisee-eligibility'

interface Props {
  params: Promise<{ state: string; id: string }>
}

export const dynamicParams = true

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, id } = await params

  if (!isValidStateSlug(stateSlug) || !isUUID(id)) {
    return { robots: { index: false, follow: true } }
  }

  const stateName = stateSlugToDisplayName(stateSlug)
  const supervisee = await fetchPublicSuperviseeById(id)
  const name = supervisee?.fullName ?? 'Supervisee'

  return buildMetadata({
    title: `${name} — Supervisee in ${stateName}`,
    description: `View ${name}'s supervision needs, credentials, and availability in ${stateName}. Sign up as a Supervisor to connect on ${SITE_NAME}.`,
    path: `/browse-supervisees/${stateSlug}/${id}`,
    noIndex: true,
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SuperviseeProfilePage({ params }: Props) {
  const { state: stateSlug, id } = await params

  if (!isValidStateSlug(stateSlug) || !isUUID(id)) {
    notFound()
  }

  const stateName = stateSlugToDisplayName(stateSlug)
  const supervisee = await fetchPublicSuperviseeById(id)

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Browse Supervisees', href: '/browse-supervisees' },
    { name: stateName, href: `/browse-supervisees/${stateSlug}` },
    {
      name: supervisee?.fullName ?? 'Supervisee Profile',
      href: `/browse-supervisees/${stateSlug}/${id}`,
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {supervisee ? (
        <SuperviseePublicProfile supervisee={supervisee} superviseeId={id} />
      ) : (
        <ProfileNotFound stateSlug={stateSlug} stateName={stateName} />
      )}

      <div className="mt-10 border-t pt-8">
        <Link
          href={`/browse-supervisees/${stateSlug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Browse more Supervisees in {stateName}
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile card
// ---------------------------------------------------------------------------

function SuperviseePublicProfile({
  supervisee,
  superviseeId,
}: {
  supervisee: PublicSuperviseeProfile
  superviseeId: string
}) {
  const format = supervisee.preferredFormat
    ? formatSupervisionFormat(supervisee.preferredFormat)
    : ''
  const tags = [supervisee.title, format].filter(Boolean)
  // The public endpoint already strips the blocks the supervisee kept private.
  const { pronouns, genderIdentity, languages } = formatPublicIdentity(supervisee)

  const neededTypes = supervisee.typeOfSupervisorNeeded.filter(Boolean)
  const hasMdNeed = neededTypes.some((name) => isMedicalDirectorType({ name }))
  const hasNonMdNeed = neededTypes.some((name) => !isMedicalDirectorType({ name }))
  const supervisorNeeded = neededTypes.map(supervisionTypeDisplayLabel).join(', ')

  const timeline = formatHowSoonLooking(supervisee.howSoonLooking, supervisee.lookingDate, {
    emptyFallback: '',
  })
  // Same rule as the browse card: MD-only supervisees carry 0/0 budget defaults
  // with no budget type, so only show a budget when a type was actually chosen.
  const budget =
    supervisee.budgetRangeType &&
    (supervisee.budgetRangeStart != null || supervisee.budgetRangeEnd != null)
      ? formatBudgetRange(
          supervisee.budgetRangeStart,
          supervisee.budgetRangeEnd,
          supervisee.budgetRangeType,
        )
      : ''

  const mdTimeline = formatHowSoonLooking(supervisee.mdHowSoonLooking, supervisee.mdLookingDate, {
    emptyFallback: '',
  })
  const mdBudget =
    supervisee.mdMonthlyBudget != null && supervisee.mdMonthlyBudget > 0
      ? `$${supervisee.mdMonthlyBudget}/month`
      : ''
  const showMdNeed =
    hasMdNeed &&
    Boolean(
      mdBudget || mdTimeline || supervisee.mdPreferredOccupation || supervisee.mdPreferredSpecialty,
    )

  // MD-only signups copy the ideal-supervisor text into mdIdealDescription — skip the duplicate.
  const mdIdealDescription =
    supervisee.mdIdealDescription && supervisee.mdIdealDescription !== supervisee.idealSupervisor
      ? supervisee.mdIdealDescription
      : ''

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Hero */}
      <div className="flex flex-col gap-5 border-b p-6 sm:flex-row sm:items-start">
        {supervisee.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supervisee.profilePhotoUrl}
            alt={`${supervisee.fullName} profile photo`}
            className="size-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#E2F0E8] text-2xl font-semibold text-[#006D36]"
            aria-hidden="true"
          >
            {initials(supervisee.fullName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {supervisee.fullName}
            {pronouns && (
              <span className="ml-2 text-base font-normal text-muted-foreground">({pronouns})</span>
            )}
          </h1>
          {supervisee.location && (
            <p className="mt-0.5 text-sm text-muted-foreground">{supervisee.location}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
              Seeking supervision
            </span>
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
        {supervisee.title && <ProfileDetail label="Credential / Title" value={supervisee.title} />}
        {supervisee.occupation && (
          <ProfileDetail label="Occupation" value={supervisee.occupation} />
        )}
        {supervisee.specialty && <ProfileDetail label="Specialty" value={supervisee.specialty} />}
        {supervisorNeeded && <ProfileDetail label="Supervisor Needed" value={supervisorNeeded} />}
        {format && <ProfileDetail label="Supervision Format" value={format} />}
        {supervisee.availability && (
          <ProfileDetail label="Availability" value={formatAvailability(supervisee.availability)} />
        )}
        {hasNonMdNeed && timeline && <ProfileDetail label="Timeline" value={timeline} />}
        {genderIdentity && <ProfileDetail label="Gender Identity" value={genderIdentity} />}
        {languages.length > 0 && <ProfileDetail label="Languages" value={languages.join(', ')} />}
      </div>

      {/* Licensed in */}
      {supervisee.stateOfLicensure.length > 0 && (
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
              Licensed in {supervisee.stateOfLicensure.length} state
              {supervisee.stateOfLicensure.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {supervisee.stateOfLicensure.map((s) => (
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

      {/* Budget */}
      {budget && (
        <div className="grid gap-4 border-t p-6 sm:grid-cols-2">
          <ProfileDetail label="Budget" value={budget} />
        </div>
      )}

      {/* Medical Director need */}
      {showMdNeed && (
        <div className="border-t px-6 pb-6 pt-4">
          <p className="text-sm font-semibold text-foreground">Medical Director</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {mdBudget && <ProfileDetail label="Monthly Budget" value={mdBudget} />}
            {mdTimeline && <ProfileDetail label="Timeline" value={mdTimeline} />}
            {supervisee.mdPreferredOccupation && (
              <ProfileDetail
                label="Preferred Occupation"
                value={supervisee.mdPreferredOccupation}
              />
            )}
            {supervisee.mdPreferredSpecialty && (
              <ProfileDetail label="Preferred Specialty" value={supervisee.mdPreferredSpecialty} />
            )}
          </div>
        </div>
      )}

      {/* About */}
      {supervisee.introduction && (
        <div className="border-t px-6 pb-6 pt-4">
          <p className="text-sm font-semibold text-foreground">About</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {supervisee.introduction}
          </p>
        </div>
      )}

      {/* What they want in a supervisor */}
      {(supervisee.idealSupervisor || mdIdealDescription) && (
        <div className="border-t px-6 pb-6 pt-4">
          <p className="text-sm font-semibold text-foreground">Looking For in a Supervisor</p>
          {supervisee.idealSupervisor && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {supervisee.idealSupervisor}
            </p>
          )}
          {mdIdealDescription && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {mdIdealDescription}
            </p>
          )}
        </div>
      )}

      {/* CTA — sign-in required only to contact */}
      <div className="border-t bg-muted/30 px-6 py-5">
        <p className="text-sm text-muted-foreground">
          Ready to connect? Sign in or create a free Supervisor account to contact{' '}
          {supervisee.fullName}.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/login?redirect=/find-supervisees/${superviseeId}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Contact
          </Link>
          <Link
            href="/signup?type=supervisor"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Not found (hidden, removed, or never existed)
// ---------------------------------------------------------------------------

function ProfileNotFound({ stateSlug, stateName }: { stateSlug: string; stateName: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-12 text-center">
      <h1 className="text-2xl font-bold text-foreground">Supervisee Not Found</h1>
      <p className="mt-3 text-muted-foreground">
        This Supervisee profile could not be found or may have been removed. Browse other
        Supervisees in {stateName}.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/browse-supervisees/${stateSlug}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Supervisees in {stateName}
        </Link>
        <Link
          href="/browse-supervisees"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Browse all states
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
