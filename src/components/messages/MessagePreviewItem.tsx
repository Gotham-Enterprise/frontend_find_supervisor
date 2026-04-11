'use client'

import { memo } from 'react'

import { formatRelativeTime } from '@/components/notifications/utils'
import { cn } from '@/lib/utils'

import type { ConversationPreview, ParticipantRole } from './types'

/**
 * Deterministic avatar color palette keyed by a hash of the participant name.
 * Keeps avatars consistent across re-renders without requiring stored data.
 */
const AVATAR_PALETTE: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: 'bg-brand-light', fg: 'text-primary' },
  { bg: 'bg-blue-100', fg: 'text-blue-700' },
  { bg: 'bg-amber-100', fg: 'text-amber-700' },
  { bg: 'bg-violet-100', fg: 'text-violet-700' },
  { bg: 'bg-rose-100', fg: 'text-rose-700' },
  { bg: 'bg-teal-100', fg: 'text-teal-700' },
]

function pickAvatarColor(name: string): { bg: string; fg: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[index] ?? AVATAR_PALETTE[0]!
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

const ROLE_LABEL: Record<ParticipantRole, string> = {
  supervisor: 'Supervisor',
  supervisee: 'Supervisee',
}

interface MessagePreviewItemProps {
  conversation: ConversationPreview
  onClick: (id: string) => void
}

export const MessagePreviewItem = memo(function MessagePreviewItem({
  conversation,
  onClick,
}: MessagePreviewItemProps) {
  const {
    id,
    participantName,
    participantRole,
    lastMessage,
    lastMessageSender,
    isRead,
    updatedAt,
    unreadCount,
  } = conversation

  const color = pickAvatarColor(participantName)
  const initials = getInitials(participantName)
  const preview = lastMessageSender === 'me' ? `You: ${lastMessage}` : lastMessage

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40',
        !isRead && 'bg-brand-light/20',
      )}
    >
      {/* Avatar */}
      <span
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
          color.bg,
          color.fg,
        )}
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1">
        {/* Name + timestamp + unread badge */}
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm leading-snug',
              isRead ? 'font-medium text-foreground/80' : 'font-semibold text-foreground',
            )}
          >
            {participantName}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {formatRelativeTime(updatedAt)}
            </span>
            {!isRead && unreadCount && unreadCount > 0 ? (
              <span className="flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-primary-foreground">
                {unreadCount}
              </span>
            ) : null}
          </div>
        </div>

        {/* Role context label */}
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
          {ROLE_LABEL[participantRole]}
        </p>

        {/* Last message preview */}
        <p
          className={cn(
            'mt-0.5 truncate text-[13px] leading-snug',
            isRead ? 'text-muted-foreground' : 'font-medium text-foreground/75',
          )}
        >
          {preview}
        </p>
      </div>
    </button>
  )
})
