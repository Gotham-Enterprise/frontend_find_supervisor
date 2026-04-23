'use client'

import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'
import { useConversations } from '@/lib/hooks/useChat'
import { useTopbarDropdown } from '@/lib/hooks/useTopbarDropdown'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/chat'

import { MessagesPanel } from './MessagesPanel'
import type { ConversationPreview } from './types'

function mapConversationToPreview(
  conversation: Conversation,
  currentUserId: string | undefined,
  isSupervisee: boolean,
): ConversationPreview {
  const other = isSupervisee ? conversation.supervisor : conversation.supervisee
  const otherName =
    other.fullName || [other.firstName, other.lastName].filter(Boolean).join(' ') || 'Unknown'

  return {
    id: conversation.id,
    participantName: otherName,
    participantRole: isSupervisee ? 'supervisor' : 'supervisee',
    lastMessage: conversation.lastMessagePreview ?? '',
    lastMessageSender: conversation.lastMessageAt && !conversation.unreadCount ? 'me' : 'them',
    isRead: conversation.unreadCount === 0,
    updatedAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : new Date(0),
    unreadCount: conversation.unreadCount,
  }
}

/**
 * Self-contained message bell for the dashboard topbar.
 * Fetches real conversations via useConversations() and navigates to /messages.
 */
export function MessageBell() {
  const { open, toggle, close, containerRef } = useTopbarDropdown()
  const router = useRouter()
  const { user } = useUser()
  const isSupervisee = isSuperviseeRole(user?.role)

  const { data: conversations = [] } = useConversations()

  const previews = useMemo<ConversationPreview[]>(
    () => conversations.map((c) => mapConversationToPreview(c, user?.id, isSupervisee)),
    [conversations, user?.id, isSupervisee],
  )

  const unreadCount = previews.filter((c) => !c.isRead).length

  function handleOpenConversation(id: string) {
    router.push(`/messages/${id}`)
    close()
  }

  function handleSeeAll() {
    router.push('/messages')
    close()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Messages, ${unreadCount} unread` : 'Messages'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors',
          'hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'bg-muted text-foreground',
        )}
      >
        <MessageCircle className="h-[18px] w-[18px]" />

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
          <MessagesPanel
            conversations={previews}
            onOpenConversation={handleOpenConversation}
            onSeeAll={handleSeeAll}
          />
        </div>
      )}
    </div>
  )
}
