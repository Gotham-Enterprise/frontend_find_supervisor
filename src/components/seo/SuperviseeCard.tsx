import Link from 'next/link'

import { getAvatarColor } from '@/components/SearchSupervisee/helpers'
import type { PublicSuperviseeSummary } from '@/lib/api/public-supervisees'
import { stateValueToSlug } from '@/lib/seo/routes'
import { formatHowSoonLooking, formatSupervisionFormat } from '@/lib/utils/profile-formatters'

interface SuperviseeCardProps {
  supervisee: PublicSuperviseeSummary
  /** Position in the results grid — drives the initials avatar color. */
  index: number
  /**
   * State of the page the card is on (e.g. "california"). When omitted, the
   * profile link uses the supervisee's first licensed state.
   */
  stateSlug?: string
}

/**
 * Lightweight supervisee card for the public /browse-supervisees pages; links to
 * the public profile at /browse-supervisees/[state]/[id].
 * Server Component — no auth dependencies. `fullName` arrives already masked
 * server-side ("Maria S"), so it is rendered as-is with no client re-masking.
 */
export function SuperviseeCard({ supervisee, index, stateSlug }: SuperviseeCardProps) {
  const profileStateSlug =
    stateSlug ??
    [...supervisee.stateOfLicensure, supervisee.state]
      .map(stateValueToSlug)
      .find((slug) => slug !== null)
  // No recognizable state means no profile URL — fall back to the signup CTA.
  const profileHref = profileStateSlug
    ? `/browse-supervisees/${profileStateSlug}/${supervisee.id}`
    : null
  const format = supervisee.preferredFormat
    ? formatSupervisionFormat(supervisee.preferredFormat)
    : ''
  const timeline = formatHowSoonLooking(supervisee.howSoonLooking, undefined, {
    compact: true,
    emptyFallback: '',
  })
  const licensedIn = supervisee.stateOfLicensure.join(', ')
  const supervisorNeeded = supervisee.typeOfSupervisorNeeded.filter(Boolean).join(', ')
  // Quick-scan card: credential only — occupation, specialty, budget and the
  // ideal-supervisor text live on the profile page.
  const credential = supervisee.title || supervisee.occupation
  const tags = [format, licensedIn && `Licensed in ${licensedIn}`, timeline].filter(Boolean)

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        {supervisee.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supervisee.profilePhotoUrl}
            alt={`${supervisee.fullName} profile photo`}
            className="size-14 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ${getAvatarColor(index)}`}
            aria-hidden="true"
          >
            {initials(supervisee.fullName)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{supervisee.fullName}</h3>
          {credential && <p className="truncate text-sm text-muted-foreground">{credential}</p>}
          {supervisee.location && (
            <p className="text-sm text-muted-foreground">{supervisee.location}</p>
          )}
        </div>
      </div>

      {supervisorNeeded && (
        <p className="text-sm">
          <span className="font-medium text-foreground">Supervisor Needed: </span>
          <span className="text-muted-foreground">{supervisorNeeded}</span>
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href={profileHref ?? '/signup?type=supervisor'}
        className="mt-auto inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {profileHref ? 'View Profile' : 'Sign up to connect'}
      </Link>
    </article>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
