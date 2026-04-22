'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useConversations } from '@/lib/hooks/useChat'

import { ChatEmptyState } from './ChatEmptyState'
import { ConversationListItem } from './ConversationListItem'

interface ConversationListProps {
  activeConversationId?: string
  onSelect: (id: string) => void
}

function ConversationListSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3.5">
          <Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-3 w-10 rounded" />
            </div>
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ConversationList({ activeConversationId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading, isError, refetch } = useConversations()

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <ConversationListSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Failed to load conversations</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            There was a problem fetching your messages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <ChatEmptyState
          title="No conversations yet"
          description="When you message a supervisor or a supervisee contacts you, your conversations will appear here."
        />
      </div>
    )
  }

  return (
    <div className="flex-1 divide-y divide-border/50 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          onClick={onSelect}
        />
      ))}
    </div>
  )
}
