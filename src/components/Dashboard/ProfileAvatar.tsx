'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils/profile-formatters'

export interface ProfileAvatarProps {
  fullName: string | null | undefined
  photoUrl: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
}

const AVATAR_SIZE: Record<NonNullable<ProfileAvatarProps['size']>, string> = {
  sm: 'size-8 text-xs',
  md: 'size-12 text-sm',
  lg: 'size-16 text-lg',
}

/** Profile photo with initials fallback when URL is missing or fails to load. */
export function ProfileAvatar({ fullName, photoUrl, size = 'md' }: ProfileAvatarProps) {
  const sizeClass = AVATAR_SIZE[size]
  const url = photoUrl?.trim() ?? ''
  /** Last URL that failed to load; show image again when `url` changes (failed URL !== current). */
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const showImage = Boolean(url && failedUrl !== url)

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external profile URLs from API
      <img
        src={url}
        alt=""
        className={cn('shrink-0 rounded-full object-cover', sizeClass)}
        onError={() => setFailedUrl(url)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
        sizeClass,
      )}
      aria-hidden
    >
      {getInitials(fullName)}
    </div>
  )
}
