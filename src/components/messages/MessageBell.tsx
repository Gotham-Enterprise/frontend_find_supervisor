'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { useTopbarDropdown } from '@/lib/hooks'
import { cn } from '@/lib/utils'

import { MessagesPanel } from './MessagesPanel'
import { MOCK_CONVERSATIONS } from './mock-data'
import type { ConversationPreview } from './types'

/**
 * Self-contained message bell for the dashboard topbar.
 *
 * State ownership:
 * - `conversations` — initialized from mock data; swap with a `useQuery` hook when ready
 *
 * To migrate to real data: replace `useState(MOCK_CONVERSATIONS)` with a
 * `useQuery` call (e.g. `GET /messages/conversations`) and thread the setter
 * through `onOpenConversation` into your mutation/invalidation handlers.
 */
export function MessageBell() {
  const { open, toggle, close, containerRef } = useTopbarDropdown()
  const [conversations, setConversations] = useState<ConversationPreview[]>(MOCK_CONVERSATIONS)

  const unreadCount = conversations.filter((c) => !c.isRead).length

  function handleOpenConversation(id: string) {
    // Optimistically mark the conversation as read when the user opens it
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isRead: true, unreadCount: 0 } : c)),
    )
    // TODO: navigate to /messages/[id] once the messages page exists
    close()
  }

  function handleSeeAll() {
    // TODO: navigate to /messages once that route exists
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
            conversations={conversations}
            onOpenConversation={handleOpenConversation}
            onSeeAll={handleSeeAll}
          />
        </div>
      )}
    </div>
  )
}
