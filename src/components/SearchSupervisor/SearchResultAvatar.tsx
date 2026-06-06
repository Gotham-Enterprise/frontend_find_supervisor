'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

interface SearchResultAvatarProps {
  photoUrl: string | undefined
  initials: string
  avatarColor: string
  className?: string
}

/** Avatar for supervisor/supervisee search result cards. */
export function SearchResultAvatar({
  photoUrl,
  initials,
  avatarColor,
  className,
}: SearchResultAvatarProps) {
  const [loadFailed, setLoadFailed] = useState(false)
  const url = photoUrl?.trim()
  const showImage = Boolean(url && !loadFailed)

  if (!showImage) {
    return (
      <div
        className={cn(
          'flex size-14 items-center justify-center rounded-full text-lg font-bold text-white',
          avatarColor,
          className,
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
      className={cn('size-14 shrink-0 rounded-full object-cover', className)}
      onError={() => setLoadFailed(true)}
    />
  )
}
