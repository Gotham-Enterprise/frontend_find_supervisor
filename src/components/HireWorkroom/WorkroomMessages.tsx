'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'

import { ConversationThread } from '@/components/Chat/ConversationThread'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createOrGetConversation } from '@/lib/api/chat'
import { chatKeys } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import type { HireListItem } from '@/types/hire'

/**
 * The hire's own message room — one per hire, like Upwork's one room per
 * contract — opened (or created) on first view and shown with the same
 * thread as the Messages page.
 */
export function WorkroomMessages({ hire }: { hire: HireListItem }) {
  const queryClient = useQueryClient()
  const room = useQuery({
    queryKey: [...chatKeys.all, 'hire-room', hire.id],
    queryFn: async () => {
      const conversation = await createOrGetConversation({ hireId: hire.id })
      // The thread reads the room's details from the conversation list.
      await queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      return conversation
    },
    retry: false,
    staleTime: Infinity,
  })

  if (room.isLoading) {
    return <Skeleton className="h-[min(70vh,640px)] w-full rounded-xl" />
  }
  if (room.isError || !room.data) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {room.error ? parseApiError(room.error) : "We couldn't open the messages."}
        </p>
        <Button variant="outline" size="sm" onClick={() => void room.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[min(70vh,640px)] overflow-hidden rounded-xl border bg-white">
      {/* The workroom header already shows the supervisor and status. */}
      <ConversationThread conversationId={room.data.id} hideHeader />
    </div>
  )
}
