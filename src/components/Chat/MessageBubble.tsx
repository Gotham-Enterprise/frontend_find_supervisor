import { Check, CheckCheck, Clock, Lock } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chat'

/** Cap bubble width as a share of the thread; 84% ≈ 20% wider than the previous 70%. */
const BUBBLE_MAX_WIDTH_CLASS = 'max-w-[84%]'

/** Same shell as an incoming text bubble — locked previews use this so they don’t sit flat on the page. */
const INCOMING_BUBBLE =
  'min-w-0 max-w-full rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-foreground shadow-sm ring-1 ring-border/50'

interface MessageBubbleProps {
  message: ChatMessage
  isMine: boolean
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Single check  — delivered (backend confirmed receipt)
 * Double check  — seen/read by the recipient
 * Clock         — optimistic (not yet confirmed by server)
 */
function MessageStatus({ message }: { message: ChatMessage }) {
  const isOptimistic = message.id.startsWith('optimistic-')

  if (isOptimistic) {
    return <Clock className="h-3 w-3 text-primary-foreground/50" />
  }

  if (message.isRead) {
    return <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/80" />
  }

  if (message.deliveredAt) {
    return <Check className="h-3 w-3 text-primary-foreground/60" />
  }

  // Sent but not yet delivered (server confirmed but delivery event hasn't arrived)
  return <Check className="h-3 w-3 text-primary-foreground/40" />
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  if (message.locked) {
    return (
      <div className="flex justify-start">
        <div className={cn('flex min-w-0 flex-col', BUBBLE_MAX_WIDTH_CLASS)}>
          <div className={cn('flex items-start gap-2', INCOMING_BUBBLE)}>
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="select-none break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
                {message.preview || 'Message locked'}
              </p>
              <p className="mt-1.5 text-xs font-medium text-amber-600">
                Upgrade your plan to read full messages
              </p>
            </div>
          </div>
          <div className="mt-1 flex justify-start pl-1">
            <span className="text-[11px] text-muted-foreground/60">
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className={cn('min-w-0', BUBBLE_MAX_WIDTH_CLASS, isMine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            isMine
              ? 'min-w-0 max-w-full rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground'
              : INCOMING_BUBBLE,
          )}
        >
          <p className="min-w-0 break-words text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
            {message.body}
          </p>
        </div>

        {/* Timestamp + delivery/read status (own messages only) */}
        <div
          className={cn(
            'mt-1 flex items-center gap-1',
            isMine ? 'justify-end pr-1' : 'justify-start pl-1',
          )}
        >
          <span className="text-[11px] text-muted-foreground/60">
            {formatTime(message.createdAt)}
          </span>
          {isMine && <MessageStatus message={message} />}
        </div>
      </div>
    </div>
  )
}
