import { Check, CheckCheck, Clock, Lock } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chat'

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
        <div className="max-w-[70%]">
          <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="select-none text-[13px] italic text-muted-foreground/70">
                {message.preview || 'Message locked'}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-amber-600">
                Upgrade your plan to read full messages
              </p>
            </div>
          </div>
          <p className="mt-1 pl-1 text-[11px] text-muted-foreground/60">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[70%]', isMine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isMine
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm bg-white text-foreground shadow-sm ring-1 ring-border/50',
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
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
