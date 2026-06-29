import Link from 'next/link'

import type { PublicSupervisorSummary } from '@/lib/api/public-supervisors'
import { stateAbbreviationToSlug } from '@/lib/seo/routes'
import { maskNameToFirstInitial } from '@/lib/utils/profile-formatters'

interface SupervisorCardProps {
  supervisor: PublicSupervisorSummary
  /**
   * Optional URL slug for the state page (e.g. "california").
   * When provided, the profile link uses /supervisors/[stateSlug]/[id].
   * Falls back to deriving the slug from supervisor.state abbreviation.
   */
  stateSlug?: string
}

/**
 * Lightweight supervisor card for public pSEO landing pages.
 * Server Component — no auth dependencies.
 */
export function SupervisorCard({ supervisor, stateSlug }: SupervisorCardProps) {
  const resolvedStateSlug = stateSlug ?? stateAbbreviationToSlug(supervisor.state) ?? 'supervisors'
  const profileHref =
    resolvedStateSlug === 'supervisors'
      ? `/supervisors/profile/${supervisor.id}`
      : `/supervisors/${resolvedStateSlug}/${supervisor.id}`
  const location = [supervisor.city, supervisor.state].filter(Boolean).join(', ')
  const tags = [supervisor.licenseType, supervisor.specialty].filter(Boolean)
  // Guests only see a supervisor's first name + last initial ("Jim S") in listings.
  const displayName = maskNameToFirstInitial(supervisor.fullName)

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        {supervisor.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supervisor.profilePhotoUrl}
            alt={`${displayName} profile photo`}
            className="size-12 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#E2F0E8] text-base font-semibold text-[#006D36]"
            aria-hidden="true"
          >
            {initials(displayName)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{displayName}</h3>
          {location && <p className="text-sm text-muted-foreground">{location}</p>}
        </div>
      </div>

      {/* Tags */}
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
          {supervisor.supervisionFormat && (
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {supervisor.supervisionFormat}
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {supervisor.bio && (
        <p className="line-clamp-3 text-sm text-muted-foreground">{supervisor.bio}</p>
      )}

      {/* CTA */}
      <Link
        href={profileHref}
        className="mt-auto inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        View Profile
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
