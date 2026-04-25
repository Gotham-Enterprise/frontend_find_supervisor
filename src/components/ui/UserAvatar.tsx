'use client'

import { type ReactNode, useMemo, useState } from 'react'

import { useUserPresence } from '@/lib/hooks/useUserPresence'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils/profile-formatters'

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type UserAvatarProps = {
  src?: string | null
  name?: string | null
  alt?: string
  size?: UserAvatarSize
  className?: string
  showPresence?: boolean
  /** When set with showPresence, reads from PresenceContext via useUserPresence */
  userId?: string | null
  /**
   * When showPresence is true and userId is omitted, set presenceKnown + isOnline
   * to render a controlled dot (e.g. server snapshot).
   */
  presenceKnown?: boolean
  isOnline?: boolean
  /**
   * Ring color around the status dot (Tailwind ring utilities), e.g. ring-white or
   * ring-brand-light so the dot stays crisp on tinted row backgrounds.
   */
  presenceRingClassName?: string
  /** Renders at bottom-right instead of presence (e.g. locked conversation badge) */
  bottomRightSlot?: ReactNode
}

const SIZE_STYLES: Record<
  UserAvatarSize,
  {
    box: string
    text: string
    dot: string
  }
> = {
  xs: {
    box: 'size-6',
    text: 'text-[10px] leading-none',
    dot: 'h-1.5 w-1.5 ring-2',
  },
  sm: {
    box: 'size-8',
    text: 'text-xs leading-none',
    dot: 'h-2 w-2 ring-2',
  },
  md: {
    box: 'size-10',
    text: 'text-sm leading-none',
    dot: 'h-3 w-3 ring-2',
  },
  lg: {
    box: 'size-12',
    text: 'text-base leading-none',
    dot: 'h-3.5 w-3.5 ring-2',
  },
  xl: {
    box: 'size-[72px]',
    text: 'text-2xl leading-none',
    dot: 'h-[18px] w-[18px] ring-2',
  },
}

const CORNER_INSET = 'right-0 bottom-0 translate-x-[18%] translate-y-[18%]'

function resolvePresence(
  showPresence: boolean,
  userId: string | null | undefined,
  presenceKnown: boolean | undefined,
  isOnline: boolean | undefined,
  hookLabel: string | null,
  hookIsOnline: boolean,
): { showDot: boolean; online: boolean; ariaLabel: string } {
  if (!showPresence) {
    return { showDot: false, online: false, ariaLabel: '' }
  }
  if (userId) {
    if (hookLabel === null) {
      return { showDot: false, online: false, ariaLabel: '' }
    }
    return {
      showDot: true,
      online: hookIsOnline,
      ariaLabel: hookIsOnline ? 'Online' : 'Offline',
    }
  }
  if (presenceKnown) {
    return {
      showDot: true,
      online: Boolean(isOnline),
      ariaLabel: isOnline ? 'Online' : 'Offline',
    }
  }
  return { showDot: false, online: false, ariaLabel: '' }
}

/**
 * Circular user avatar with optional initials fallback and optional presence dot
 * anchored to the bottom-right (slightly overlapping), with a ring for contrast.
 */
export function UserAvatar({
  src,
  name,
  alt,
  size = 'md',
  className,
  showPresence = false,
  userId,
  presenceKnown,
  isOnline,
  presenceRingClassName = 'ring-white',
  bottomRightSlot,
}: UserAvatarProps) {
  const styles = SIZE_STYLES[size]
  const url = src?.trim() ?? ''
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showImage = Boolean(url && failedUrl !== url)

  const presenceUserId = showPresence && userId ? userId : undefined
  const { isOnline: hookOnline, label: hookLabel } = useUserPresence(presenceUserId)

  const { showDot, online, ariaLabel } = useMemo(
    () =>
      resolvePresence(
        Boolean(showPresence),
        userId,
        presenceKnown,
        isOnline,
        hookLabel,
        hookOnline,
      ),
    [showPresence, userId, presenceKnown, isOnline, hookLabel, hookOnline],
  )

  const displayAlt = alt ?? (name?.trim() ? `Profile photo of ${name.trim()}` : 'Profile photo')
  const initials = getInitials(name)
  const initialsLabel = name?.trim() ? `${name.trim()}, avatar` : 'User avatar'

  const corner = bottomRightSlot ? (
    <span className={cn('pointer-events-none absolute z-10', CORNER_INSET)}>
      <span className="pointer-events-auto inline-flex">{bottomRightSlot}</span>
    </span>
  ) : showDot ? (
    <span
      role="status"
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        'pointer-events-none absolute z-10 rounded-full',
        CORNER_INSET,
        styles.dot,
        presenceRingClassName,
        online ? 'bg-green-500' : 'bg-zinc-400',
      )}
    />
  ) : null

  return (
    <span className={cn('relative inline-flex shrink-0 align-middle', className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- external profile URLs from API
        <img
          src={url}
          alt={displayAlt}
          className={cn('block rounded-full object-cover', styles.box)}
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <span
          className={cn(
            'flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
            styles.box,
            styles.text,
          )}
          role="img"
          aria-label={initialsLabel}
        >
          {initials}
        </span>
      )}
      {corner}
    </span>
  )
}
