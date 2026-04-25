'use client'

import { Lock, MessageSquareOff, Send } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { SubscriptionModal } from '@/components/Dashboard/subscription/SubscriptionModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
  conversationId: string
  locked: boolean
  remainingMessages: number
  isPending: boolean
  isSending: boolean
  /** Realtime: supervisor has disabled messaging via settings */
  messagingDisabled?: boolean
  /** Realtime: explanation text from supervisor settings */
  disabledMessageInfo?: string | null
  onSend: (body: string) => void
  onTyping: (isTyping: boolean) => void
}

export function MessageComposer({
  locked,
  remainingMessages,
  isPending,
  isSending,
  messagingDisabled = false,
  disabledMessageInfo,
  onSend,
  onTyping,
}: MessageComposerProps) {
  const [text, setText] = useState('')
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLimitReached = isPending && remainingMessages === 0
  const isDisabled = locked || isLimitReached || isSending || messagingDisabled

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value)

      if (!isDisabled) {
        onTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false)
          typingTimeoutRef.current = null
        }, 1500)
      }
    },
    [isDisabled, onTyping],
  )

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setText('')
    onTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [text, isDisabled, onSend, onTyping])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  if (locked) {
    return (
      <>
        <SubscriptionModal open={planModalOpen} onOpenChange={setPlanModalOpen} />
        <div className="shrink-0 border-t border-border bg-white px-4 py-3">
          <div className="flex flex-col gap-3 rounded-lg bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[13px] font-medium text-amber-700">
                Upgrade your plan to read full messages and reply.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="shrink-0 self-stretch sm:self-center"
              onClick={() => setPlanModalOpen(true)}
            >
              Upgrade Now!
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (messagingDisabled) {
    return (
      <div className="shrink-0 border-t border-border bg-white px-4 py-3">
        <div className="flex items-start gap-2.5 rounded-lg bg-muted px-4 py-3">
          <MessageSquareOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-[13px] font-medium text-foreground">
              Messaging is currently unavailable
            </p>
            {disabledMessageInfo && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{disabledMessageInfo}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLimitReached) {
    return (
      <div className="shrink-0 border-t border-border bg-white px-4 py-3">
        <div className="rounded-lg bg-muted px-4 py-3">
          <p className="text-[13px] font-medium text-foreground">Message limit reached</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            You can only send up to 5 messages until the request is accepted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="shrink-0 border-t border-border bg-white">
      {/* Remaining messages warning when running low */}
      {isPending && remainingMessages > 0 && remainingMessages <= 2 && (
        <div className="border-b border-border/50 bg-amber-50 px-4 py-2">
          <p className="text-[12px] text-amber-700">
            {remainingMessages === 1
              ? '1 message remaining until the request is accepted.'
              : `${remainingMessages} messages remaining until the request is accepted.`}
          </p>
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className={cn(
            'max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          style={{
            height: 'auto',
            overflowY: text.split('\n').length > 4 ? 'auto' : 'hidden',
          }}
          onInput={(e) => {
            const target = e.currentTarget
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`
          }}
        />
        <Button
          size="icon-sm"
          onClick={handleSend}
          disabled={!text.trim() || isDisabled}
          aria-label="Send message"
          className="mb-0.5 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
