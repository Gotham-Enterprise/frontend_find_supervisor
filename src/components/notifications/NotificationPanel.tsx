'use client'

import { BellOff } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { NotificationItem } from './NotificationItem'
import type { AppNotification, NotificationFilter } from './types'

interface NotificationPanelProps {
  notifications: AppNotification[]
  /** Map of notificationId → actionKey for CTAs already acted upon */
  actedMap: Record<string, string>
  onMarkRead: (id: string) => void
  onAction: (notificationId: string, actionKey: string) => void
  /** Called when the "See previous notifications" footer is clicked */
  onSeeAll: () => void
  /** Called when the user clicks "Mark all as read". Only shown when there are unread items. */
  onMarkAllRead?: () => void
}

interface FilterTabProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterTab({ label, active, onClick }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1 text-[13px] font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

function EmptyState({ filter }: { filter: NotificationFilter }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <BellOff className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {filter === 'unread' ? 'All caught up!' : 'No read notifications'}
      </p>
      <p className="max-w-[200px] text-[13px] text-muted-foreground">
        {filter === 'unread'
          ? 'You have no unread notifications right now.'
          : 'Notifications you have read will appear here.'}
      </p>
    </div>
  )
}

export function NotificationPanel({
  notifications,
  actedMap,
  onMarkRead,
  onAction,
  onSeeAll,
  onMarkAllRead,
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<NotificationFilter>('unread')

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : n.isRead))

  function handleAction(notificationId: string, actionKey: string) {
    onAction(notificationId, actionKey)
    onMarkRead(notificationId)
  }

  return (
    <div className="flex w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[15px] font-semibold text-foreground">Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              className="text-[12px] font-medium text-primary transition-colors hover:text-primary/80"
            >
              Mark all as read
            </button>
          )}
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex shrink-0 gap-1 border-b border-border px-4 py-2">
        <FilterTab
          label={`Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          active={filter === 'unread'}
          onClick={() => setFilter('unread')}
        />
        <FilterTab label="Read" active={filter === 'read'} onClick={() => setFilter('read')} />
      </div>

      {/* Notification list */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onAction={handleAction}
              actedKey={actedMap[notification.id]}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border">
        <button
          onClick={onSeeAll}
          className="w-full py-3 text-center text-[13px] font-medium text-primary transition-colors hover:bg-muted"
        >
          See previous notifications
        </button>
      </div>
    </div>
  )
}
