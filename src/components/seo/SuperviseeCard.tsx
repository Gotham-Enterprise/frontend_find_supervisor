import Link from 'next/link'

import { getAvatarColor } from '@/components/SearchSupervisee/helpers'
import type { PublicSuperviseeSummary } from '@/lib/api/public-supervisees'
import {
  formatBudgetRange,
  formatHowSoonLooking,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'

interface SuperviseeCardProps {
  supervisee: PublicSuperviseeSummary
  /** Position in the results grid — drives the initials avatar color. */
  index: number
}

/**
 * Lightweight supervisee card for the public /browse-supervisees page.
 * Server Component — no auth dependencies. `fullName` arrives already masked
 * server-side ("Maria S"), so it is rendered as-is with no client re-masking.
 */
export function SuperviseeCard({ supervisee, index }: SuperviseeCardProps) {
  const format = supervisee.preferredFormat
    ? formatSupervisionFormat(supervisee.preferredFormat)
    : ''
  const timeline = formatHowSoonLooking(supervisee.howSoonLooking, undefined, {
    compact: true,
    emptyFallback: '',
  })
  const budget =
    supervisee.budgetRangeStart != null || supervisee.budgetRangeEnd != null
      ? formatBudgetRange(
          supervisee.budgetRangeStart,
          supervisee.budgetRangeEnd,
          supervisee.budgetRangeType,
        )
      : ''
  const lookingIn = supervisee.stateTheyAreLookingIn.join(', ')
  const supervisorNeeded = supervisee.typeOfSupervisorNeeded.filter(Boolean).join(', ')
  const credentialLine = [supervisee.title, supervisee.occupation, supervisee.specialty]
    .filter(Boolean)
    .join(' · ')

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
          {credentialLine && <p className="text-sm text-muted-foreground">{credentialLine}</p>}
          {supervisee.location && (
            <p className="text-sm text-muted-foreground">{supervisee.location}</p>
          )}
        </div>
      </div>

      {/* What they're looking for in a supervisor */}
      {(supervisorNeeded || format || lookingIn || timeline || budget) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Looking For
          </p>
          <dl className="mt-1 space-y-1 text-sm">
            {supervisorNeeded && (
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">Supervisor Needed:</dt>
                <dd className="text-muted-foreground">{supervisorNeeded}</dd>
              </div>
            )}
            {format && (
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">Supervision Type:</dt>
                <dd className="text-muted-foreground">{format}</dd>
              </div>
            )}
            {lookingIn && (
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">States:</dt>
                <dd className="text-muted-foreground">{lookingIn}</dd>
              </div>
            )}
            {timeline && (
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">Timeline:</dt>
                <dd className="text-muted-foreground">{timeline}</dd>
              </div>
            )}
            {budget && (
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">Budget:</dt>
                <dd className="text-muted-foreground">{budget}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Bio — what they want in a supervisor */}
      {supervisee.bio && (
        <p className="line-clamp-3 text-sm text-muted-foreground">{supervisee.bio}</p>
      )}

      {/* CTA */}
      <Link
        href="/signup?type=supervisor"
        className="mt-auto inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Sign up to connect
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
