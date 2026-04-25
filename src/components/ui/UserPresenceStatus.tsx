'use client'

import { useUserPresence } from '@/lib/hooks/useUserPresence'
import { cn } from '@/lib/utils'

interface UserPresenceStatusProps {
  userId: string | null | undefined
  /** Controls how much information is shown. Defaults to "full". */
  variant?: 'dot' | 'badge' | 'full'
  className?: string
}

/**
 * Displays the realtime online/offline presence for a user.
 *
 * variant="dot"   — just the coloured indicator dot
 * variant="badge" — dot + Online/Offline label only
 * variant="full"  — dot + label + last-seen text (default)
 *
 * Usage:
 *   <UserPresenceStatus userId={supervisor.id} />
 *   <UserPresenceStatus userId={user.id} variant="badge" />
 */
export function UserPresenceStatus({
  userId,
  variant = 'full',
  className,
}: UserPresenceStatusProps) {
  const { isOnline, label, lastSeenLabel } = useUserPresence(userId)

  // No presence event received yet — render nothing to avoid a misleading "Offline"
  if (label === null) return null

  const dot = (
    <span
      aria-hidden
      className={cn(
        'inline-block h-2 w-2 shrink-0 rounded-full',
        isOnline ? 'bg-green-500' : 'bg-zinc-400',
      )}
    />
  )

  if (variant === 'dot') {
    // The dot IS the root element so `absolute` positioning from the parent works correctly.
    return (
      <span
        role="status"
        aria-label={label}
        className={cn(
          'block h-2 w-2 shrink-0 rounded-full',
          isOnline ? 'bg-green-500' : 'bg-zinc-400',
          className,
        )}
      />
    )
  }

  if (variant === 'badge') {
    return (
      <span role="status" className={cn('inline-flex items-center gap-1', className)}>
        {dot}
        <span
          className={cn(
            'text-[11px] font-medium leading-none',
            isOnline ? 'text-green-600' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      </span>
    )
  }

  // variant="full"
  return (
    <span role="status" className={cn('inline-flex flex-col gap-px', className)}>
      <span className="inline-flex items-center gap-1">
        {dot}
        <span
          className={cn(
            'text-[11px] font-medium leading-none',
            isOnline ? 'text-green-600' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      </span>
      {!isOnline && lastSeenLabel && (
        <span className="pl-3 text-[10px] leading-none text-muted-foreground/70">
          {lastSeenLabel}
        </span>
      )}
    </span>
  )
}
