import { useMemo } from 'react'

import { formatRelativeTime } from '@/components/notifications/utils'
import { usePresence, type UserPresence } from '@/lib/contexts/PresenceContext'

export interface UserPresenceResult extends UserPresence {
  /**
   * "Online" | "Offline" | null
   * null means no presence event has been received yet — render nothing.
   */
  label: string | null
  /** "Last seen just now" | "Last seen 5m ago" | null when online or unknown */
  lastSeenLabel: string | null
}

/**
 * Returns the realtime presence state for a given userId.
 * `label` is null until the first socket event is received — components
 * should render nothing in that case to avoid showing a stale "Offline".
 * Safe to call with an undefined/empty userId.
 */
export function useUserPresence(userId: string | null | undefined): UserPresenceResult {
  const { getPresence } = usePresence()

  return useMemo((): UserPresenceResult => {
    if (!userId) {
      return { known: false, isOnline: false, lastSeenAt: null, label: null, lastSeenLabel: null }
    }

    const p = getPresence(userId)

    // Not yet received any presence event — render nothing
    if (!p.known) {
      return { ...p, label: null, lastSeenLabel: null }
    }

    if (p.isOnline) {
      return { ...p, label: 'Online', lastSeenLabel: null }
    }

    let lastSeenLabel: string | null = null
    if (p.lastSeenAt) {
      try {
        const date = new Date(p.lastSeenAt)
        if (!isNaN(date.getTime())) {
          lastSeenLabel = `Last seen ${formatRelativeTime(date).toLowerCase()}`
        }
      } catch {
        // malformed date — leave label null
      }
    }

    return { ...p, label: 'Offline', lastSeenLabel }
  }, [userId, getPresence])
}
