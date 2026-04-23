'use client'

import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { ProfileAvatar } from '@/components/Dashboard/ProfileAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'
import {
  useConversationMessages,
  useConversations,
  useMarkConversationRead,
  useSendMessage,
} from '@/lib/hooks/useChat'
import { useSupervisionChatSocket } from '@/lib/hooks/useSupervisionChatSocket'
import { cn } from '@/lib/utils'

import { ChatEmptyState } from './ChatEmptyState'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'
import { TypingIndicator } from './TypingIndicator'

interface ConversationThreadProps {
  conversationId: string
  onBack: () => void
}

function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={cn('flex', i % 3 === 0 ? 'justify-end' : 'justify-start')}>
          <Skeleton className={cn('h-10 rounded-2xl', i % 3 === 0 ? 'w-48' : 'w-64')} />
        </div>
      ))}
    </div>
  )
}

export function ConversationThread({ conversationId, onBack }: ConversationThreadProps) {
  const { user } = useUser()
  const isSupervisee = isSuperviseeRole(user?.role)

  const { data: conversations } = useConversations()
  const conversation = useMemo(
    () => conversations?.find((c) => c.id === conversationId),
    [conversations, conversationId],
  )

  const { data: messages, isLoading, isError, refetch } = useConversationMessages(conversationId)
  const { mutate: markRead } = useMarkConversationRead(conversationId)
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversationId)

  // Derive locked early so the socket hook can use it.
  // locked is only ever true for an unpaid SUPERVISOR — never for a supervisee.
  const locked = conversation?.locked ?? false

  // isSupervisor=true signals the socket hook to immediately render new incoming
  // messages as locked (preview-only) without waiting for the backend override.
  const { joinConversation, sendTyping, typingUsers, messagingStatus } = useSupervisionChatSocket({
    isSupervisor: !isSupervisee && locked,
    currentUserId: user?.id,
  })

  // Bottom-of-list ref for auto-scroll
  const bottomRef = useRef<HTMLDivElement>(null)

  // Join socket room when this thread opens
  useEffect(() => {
    joinConversation(conversationId)
  }, [conversationId, joinConversation])

  // Mark as read exactly once per conversationId — fire as soon as messages first arrive.
  // Using a ref (not state) so the flag update never causes a re-render.
  const markedReadRef = useRef<string | null>(null)
  useEffect(() => {
    if (messages && markedReadRef.current !== conversationId) {
      markedReadRef.current = conversationId
      markRead()
    }
    // markRead is intentionally excluded — its identity changes each render but
    // we only want to call it once per conversation open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length])

  const handleSend = useCallback(
    (body: string) => {
      sendMessage(body)
    },
    [sendMessage],
  )

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      sendTyping(conversationId, isTyping)
    },
    [conversationId, sendTyping],
  )

  // Determine other participant for header
  const other = conversation
    ? isSupervisee
      ? conversation.supervisor
      : conversation.supervisee
    : null

  const otherDisplayName = other
    ? other.fullName || [other.firstName, other.lastName].filter(Boolean).join(' ')
    : 'Loading…'

  const hireStatus = conversation?.hire.status
  const isPending = hireStatus === 'PENDING'
  const remainingMessages = conversation?.remainingMessages ?? 0

  // Check if other participant is typing in this conversation
  const othersTyping = typingUsers.get(conversationId)
  const isOtherTyping =
    othersTyping !== undefined && othersTyping.size > 0 && !othersTyping.has(user?.id ?? '')

  // Realtime messaging-disabled state from the other participant
  const otherUserId = other?.id
  const realtimeStatus = otherUserId ? messagingStatus.get(otherUserId) : undefined
  // canMessage defaults to true (status only arrives when it changes)
  const messagingDisabled = realtimeStatus ? !realtimeStatus.canMessage : false
  const disabledMessageInfo = realtimeStatus?.disabledMessageInfo ?? null

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {other && (
          <ProfileAvatar fullName={otherDisplayName} photoUrl={other.profilePhotoUrl} size="sm" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{otherDisplayName}</p>
          {hireStatus && (
            <p className="text-[11px] text-muted-foreground">
              {isSupervisee ? 'Supervisor' : 'Supervisee'}
              {hireStatus === 'PENDING' && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-700">
                  Request Pending
                </span>
              )}
              {hireStatus === 'ACCEPTED' && (
                <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-px text-[10px] font-semibold text-green-700">
                  Accepted
                </span>
              )}
              {hireStatus === 'ACTIVE' && (
                <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-px text-[10px] font-semibold text-blue-700">
                  Active
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <MessagesSkeleton />
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Failed to load messages</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                There was a problem loading this conversation.
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
        ) : !messages || messages.length === 0 ? (
          <ChatEmptyState
            title="No messages yet"
            description="Send a message to start the conversation."
          />
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={message.senderId === user?.id || message.senderId === '__me__'}
              />
            ))}
            {isOtherTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <MessageComposer
        conversationId={conversationId}
        locked={locked}
        remainingMessages={remainingMessages}
        isPending={isPending}
        isSending={isSending}
        messagingDisabled={messagingDisabled}
        disabledMessageInfo={disabledMessageInfo}
        onSend={handleSend}
        onTyping={handleTyping}
      />
    </div>
  )
}
