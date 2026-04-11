'use client'

import { MessageSquareOff } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { MessagePreviewItem } from './MessagePreviewItem'
import type { ConversationPreview, MessageFilter } from './types'

interface MessagesPanelProps {
  conversations: ConversationPreview[]
  onOpenConversation: (id: string) => void
  onSeeAll: () => void
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

function EmptyState({ filter }: { filter: MessageFilter }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <MessageSquareOff className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {filter === 'unread' ? 'No new messages' : 'No read messages'}
      </p>
      <p className="max-w-[200px] text-[13px] text-muted-foreground">
        {filter === 'unread'
          ? "You're all caught up with your messages."
          : 'Messages you have read will appear here.'}
      </p>
    </div>
  )
}

export function MessagesPanel({ conversations, onOpenConversation, onSeeAll }: MessagesPanelProps) {
  const [filter, setFilter] = useState<MessageFilter>('unread')

  const unreadCount = conversations.filter((c) => !c.isRead).length
  const filtered = conversations.filter((c) => (filter === 'unread' ? !c.isRead : c.isRead))

  return (
    <div className="flex w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[15px] font-semibold text-foreground">Messages</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {unreadCount} new
          </span>
        )}
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

      {/* Conversation list */}
      <div className="max-h-[380px] divide-y divide-border/50 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filtered.map((conversation) => (
            <MessagePreviewItem
              key={conversation.id}
              conversation={conversation}
              onClick={onOpenConversation}
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
          See all messages
        </button>
      </div>
    </div>
  )
}
