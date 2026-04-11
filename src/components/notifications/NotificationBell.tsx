'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'

import { useTopbarDropdown } from '@/lib/hooks/useTopbarDropdown'
import { cn } from '@/lib/utils'

import { MOCK_NOTIFICATIONS } from './mock-data'
import { NotificationPanel } from './NotificationPanel'
import type { AppNotification } from './types'

/**
 * Self-contained notification bell for the dashboard topbar.
 *
 * State ownership:
 * - `notifications` — initialized from mock data; swap with a `useQuery` hook when ready
 * - `actedMap`      — tracks CTA actions taken per notification ID (local-only for now)
 *
 * To migrate to real data: replace `useState(MOCK_NOTIFICATIONS)` with a
 * `useQuery` call and thread the setter through `onMarkRead` / `onAction`
 * into your mutation handlers.
 */
export function NotificationBell() {
  const { open, toggle, close, containerRef } = useTopbarDropdown()
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS)
  const [actedMap, setActedMap] = useState<Record<string, string>>({})

  const unreadCount = notifications.filter((n) => !n.isRead).length

  function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  function handleAction(id: string, actionKey: string) {
    setActedMap((prev) => ({ ...prev, [id]: actionKey }))
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ctas: undefined, isRead: true } : n)),
    )
  }

  function handleSeeAll() {
    // TODO: navigate to /notifications when that page exists
    close()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors',
          'hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'bg-muted text-foreground',
        )}
      >
        <Bell className="h-[18px] w-[18px]" />

        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute right-0.5 top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-primary-foreground"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2">
          <NotificationPanel
            notifications={notifications}
            actedMap={actedMap}
            onMarkRead={handleMarkRead}
            onAction={handleAction}
            onSeeAll={handleSeeAll}
          />
        </div>
      )}
    </div>
  )
}
