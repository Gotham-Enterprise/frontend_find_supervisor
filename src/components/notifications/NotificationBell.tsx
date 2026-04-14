'use client'

import { Bell, Loader2 } from 'lucide-react'

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/lib/hooks/useNotifications'
import { useTopbarDropdown } from '@/lib/hooks/useTopbarDropdown'
import { cn } from '@/lib/utils'

import { NotificationPanel } from './NotificationPanel'

/**
 * Self-contained notification bell for the dashboard topbar.
 *
 * Data is fetched from GET /api/supervision/notifications and polled every 10 s.
 * Mark-read and mark-all-read mutations apply optimistic updates so the UI
 * responds instantly without waiting for the next poll cycle.
 */
export function NotificationBell() {
  const { open, toggle, close, containerRef } = useTopbarDropdown()

  const { data, isLoading } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAllRead } = useMarkAllNotificationsRead()

  const notifications = data?.notifications ?? []
  const unreadCount = data?.totalNotifUnread ?? 0

  function handleMarkRead(id: string) {
    markRead(id)
  }

  function handleAction(id: string, actionKey: string) {
    markRead(id)
    // actionKey reserved for future domain-level handlers (accept/reject requests, etc.)
    void actionKey
  }

  function handleMarkAllRead() {
    markAllRead()
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
        {isLoading ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" />
        ) : (
          <Bell className="h-[18px] w-[18px]" />
        )}

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
            actedMap={{}}
            onMarkRead={handleMarkRead}
            onAction={handleAction}
            onMarkAllRead={handleMarkAllRead}
            onSeeAll={handleSeeAll}
          />
        </div>
      )}
    </div>
  )
}
