'use client'

import { BadgeCheckIcon, ClockIcon, MapPinIcon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatHowSoonLooking } from '@/lib/utils/profile-formatters'

import { SearchResultAvatar } from '../SearchSupervisor/SearchResultAvatar'
import { FORMAT_BADGE_CLASSES, FORMAT_LABELS } from './helpers'
import type { SuperviseeSearchResult } from './types'

interface SuperviseeCardProps {
  supervisee: SuperviseeSearchResult
}

export function SuperviseeCard({ supervisee }: SuperviseeCardProps) {
  const {
    id,
    fullName,
    title,
    occupation,
    specialty,
    location,
    preferredFormat,
    howSoonLooking,
    stateTheyAreLookingIn,
    bio,
    initials,
    avatarColor,
    profilePhotoUrl,
    isConnectedWithCurrentSupervisor,
  } = supervisee

  // The API already masks fullName to "Katie C" until the supervisor is connected
  // with this supervisee, so it can be rendered directly.
  const credentialLine = [title, occupation, specialty].filter(Boolean).join(' · ')
  const timelineLabel = howSoonLooking
    ? formatHowSoonLooking(howSoonLooking, undefined, {
        compact: true,
        emptyFallback: '',
      })
    : null
  const lookingIn = stateTheyAreLookingIn.length > 0 ? stateTheyAreLookingIn.join(', ') : null

  return (
    <div className="flex gap-5 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <SearchResultAvatar
          photoUrl={profilePhotoUrl}
          initials={initials}
          avatarColor={avatarColor}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">{fullName}</h3>
              {isConnectedWithCurrentSupervisor && (
                <Badge
                  variant="outline"
                  className="shrink-0 gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  <BadgeCheckIcon className="size-3.5" />
                  Connected
                </Badge>
              )}
            </div>
            {credentialLine && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{credentialLine}</p>
            )}
          </div>
          <Link
            href={`/find-supervisees/${id}`}
            className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}
          >
            View Profile <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3.5 shrink-0" />
              {location}
            </span>
          )}
          {timelineLabel && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5 shrink-0" />
              {timelineLabel}
            </span>
          )}
          {lookingIn && <span>Looking in: {lookingIn}</span>}
          {preferredFormat && (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-xs font-medium',
                FORMAT_BADGE_CLASSES[preferredFormat],
              )}
            >
              {FORMAT_LABELS[preferredFormat]}
            </span>
          )}
        </div>

        {bio && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{bio}</p>
        )}

        {(occupation || specialty) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {occupation && (
              <Badge variant="outline" className="bg-white text-xs">
                {occupation}
              </Badge>
            )}
            {specialty && (
              <Badge variant="outline" className="bg-white text-xs">
                {specialty}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
