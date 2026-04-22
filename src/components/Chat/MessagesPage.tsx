'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { ConversationList } from './ConversationList'
import { ConversationThread } from './ConversationThread'

interface MessagesPageProps {
  conversationId?: string
}

/**
 * 2-column message center:
 * - Left (fixed width): conversation list / inbox
 * - Right (flex): selected conversation thread
 *
 * Mobile: shows list or thread depending on whether a conversationId is selected.
 */
export function MessagesPage({ conversationId }: MessagesPageProps) {
  const router = useRouter()

  const handleSelectConversation = useCallback(
    (id: string) => {
      router.push(`/messages/${id}`)
    },
    [router],
  )

  const handleBack = useCallback(() => {
    router.push('/messages')
  }, [router])

  return (
    // Bleed to fill the shell's scrollable area — override default p-8 padding via -m-8
    <div className="-m-8 flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Left column — conversation list */}
      <div
        className={`flex w-80 shrink-0 flex-col border-r border-border bg-white ${
          conversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ConversationList
          activeConversationId={conversationId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Right column — thread or empty placeholder */}
      <div
        className={`min-w-0 flex-1 flex-col bg-background-subtle ${
          conversationId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {conversationId ? (
          <ConversationThread conversationId={conversationId} onBack={handleBack} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Select a conversation</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Choose a conversation from the list to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
