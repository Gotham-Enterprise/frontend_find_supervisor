'use client'

import { ClockIcon, FileTextIcon, MapPinIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { FORMAT_BADGE_CLASSES, FORMAT_LABELS } from './helpers'
import type { SupervisorSearchResult } from './types'

/** Avatar for search results: photo when URL loads; initials fallback when missing or on error. */
function SupervisorSearchAvatar({
  photoUrl,
  initials,
  avatarColor,
}: {
  photoUrl: string | undefined
  initials: string
  avatarColor: string
}) {
  const [loadFailed, setLoadFailed] = useState(false)
  const url = photoUrl?.trim()
  const showImage = Boolean(url && !loadFailed)

  if (!showImage) {
    return (
      <div
        className={cn(
          'flex size-14 items-center justify-center rounded-full text-lg font-bold text-white',
          avatarColor,
        )}
        aria-hidden
      >
        {initials}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external profile URLs from API
    <img
      src={url}
      alt=""
      className="size-14 shrink-0 rounded-full object-cover"
      onError={() => setLoadFailed(true)}
    />
  )
}

interface SupervisorCardProps {
  supervisor: SupervisorSearchResult
}

export function SupervisorCard({ supervisor }: SupervisorCardProps) {
  const {
    id,
    fullName,
    licenseType,
    supervisorType,
    yearsOfExperience,
    location,
    licenseNumber,
    formats,
    accepting,
    bio,
    specialties,
    patientPopulation,
    initials,
    avatarColor,
    profilePhotoUrl,
  } = supervisor

  const photoUrl = profilePhotoUrl?.trim()

  return (
    <div className="flex gap-5 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Avatar column */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <SupervisorSearchAvatar
          key={photoUrl ?? 'no-photo'}
          photoUrl={photoUrl}
          initials={initials}
          avatarColor={avatarColor}
        />
        {accepting ? (
          <span className="flex items-center gap-1 text-xs font-medium text-[#006d36]">
            <span className="size-1.5 rounded-full bg-[#006d36]" />
            Accepting
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            Full
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">{fullName}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {licenseType}
              <span className="mx-1.5 text-border">·</span>
              {supervisorType}
            </p>
          </div>

          <Link
            href={`/find-supervisors/${id}`}
            className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}
          >
            View Profile <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3.5 shrink-0" />
            {yearsOfExperience} yrs experience
          </span>
          <span className="flex items-center gap-1">
            <MapPinIcon className="size-3.5 shrink-0" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <FileTextIcon className="size-3.5 shrink-0" />
            License: {licenseNumber}
          </span>
          {formats.map((fmt) => (
            <span
              key={fmt}
              className={cn(
                'rounded-md px-1.5 py-0.5 text-xs font-medium',
                FORMAT_BADGE_CLASSES[fmt],
              )}
            >
              {FORMAT_LABELS[fmt]}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{bio}</p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {specialties.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {patientPopulation.length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              Population: {patientPopulation.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
