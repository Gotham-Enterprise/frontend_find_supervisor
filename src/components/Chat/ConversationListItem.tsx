'use client'

import { Lock } from 'lucide-react'
import { memo } from 'react'

import { formatRelativeTime } from '@/components/notifications/utils'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/chat'

interface ConversationListItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: (id: string) => void
}

export const ConversationListItem = memo(function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: ConversationListItemProps) {
  const { user } = useUser()
  const isSupervisee = isSuperviseeRole(user?.role)

  // Show the other participant relative to the current user's role
  const other = isSupervisee ? conversation.supervisor : conversation.supervisee
  const otherRole = isSupervisee ? 'Supervisor' : 'Supervisee'

  const displayName = other.fullName || [other.firstName, other.lastName].filter(Boolean).join(' ')
  const preview = conversation.lastMessagePreview
  const time = conversation.lastMessageAt
    ? formatRelativeTime(new Date(conversation.lastMessageAt))
    : null
  const hasUnread = conversation.unreadCount > 0
  const isPending = conversation.hire.status === 'PENDING'
  const avatarCornerRing = isActive
    ? 'ring-brand-light'
    : hasUnread && !isActive
      ? 'ring-brand-light/50'
      : 'ring-white'

  return (
    <button
      type="button"
      onClick={() => onClick(conversation.id)}
      className={cn(
        'flex w-full gap-3 px-4 py-3.5 text-left transition-colors',
        isActive ? 'bg-brand-light' : 'hover:bg-muted/40',
        hasUnread && !isActive && 'bg-brand-light/20',
      )}
    >
      {/* Avatar */}
      <div className="mt-0.5 shrink-0">
        <UserAvatar
          size="sm"
          src={other.profilePhotoUrl}
          name={displayName}
          showPresence={!conversation.locked}
          userId={other.id}
          presenceRingClassName={avatarCornerRing}
          bottomRightSlot={
            conversation.locked ? (
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 ring-2',
                  avatarCornerRing,
                )}
                aria-hidden
              >
                <Lock className="size-2 text-amber-600" />
              </span>
            ) : undefined
          }
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Name + time + unread badge */}
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm leading-snug',
              hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80',
            )}
          >
            {displayName}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {time && <span className="text-[11px] tabular-nums text-muted-foreground">{time}</span>}
            {hasUnread && (
              <span className="flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-primary-foreground">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Role + status badges */}
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            {otherRole}
          </span>
          {isPending && conversation.remainingMessages > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-700">
              {conversation.remainingMessages} msg left
            </span>
          )}
          {isPending && conversation.remainingMessages === 0 && (
            <span className="rounded-full bg-red-50 px-1.5 py-px text-[10px] font-semibold text-red-600">
              Limit reached
            </span>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <p
            className={cn(
              'mt-0.5 truncate text-[13px] leading-snug',
              hasUnread ? 'font-medium text-foreground/75' : 'text-muted-foreground',
            )}
          >
            {preview}
          </p>
        )}
      </div>
    </button>
  )
})
