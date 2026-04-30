'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

import {
  createOrGetConversation,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendMessage,
} from '@/lib/api/chat'
import type { ChatMessage, Conversation } from '@/types/chat'

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useConversations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: fetchConversations,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  })
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId ?? ''),
    queryFn: () => fetchMessages(conversationId!, 1, 20),
    enabled: Boolean(conversationId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateOrGetConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (supervisorId: string) => createOrGetConversation(supervisorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const msg: string =
          (err.response?.data as { error?: string; message?: string } | undefined)?.error ??
          (err.response?.data as { error?: string; message?: string } | undefined)?.message ??
          'Failed to open conversation.'

        if (err.response?.status === 403) {
          // Surface the specific business-rule message from the backend
          toast.error(msg)
        } else {
          toast.error('Failed to open conversation. Please try again.')
        }
      } else {
        toast.error('Failed to open conversation. Please try again.')
      }
    },
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, body),

    onMutate: async (body) => {
      const queryKey = chatKeys.messages(conversationId)
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<ChatMessage[]>(queryKey)

      // Optimistic message — uses a temp id prefixed so dedup can strip it on real arrival
      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        senderId: '__me__',
        messageType: 'TEXT',
        body,
        preview: body,
        locked: false,
        isRead: false,
        readAt: null,
        deliveredAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData<ChatMessage[]>(queryKey, (old) => [
        ...(old ?? []),
        optimisticMessage,
      ])

      return { previous }
    },

    onSuccess: (result) => {
      const queryKey = chatKeys.messages(conversationId)
      // Replace optimistic entry with the confirmed message from the server
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old) => {
        if (!old) return [result.message]
        const withoutOptimistic = old.filter((m) => !m.id.startsWith('optimistic-'))
        // Guard against socket echo: only add if not already present
        const alreadyPresent = withoutOptimistic.some((m) => m.id === result.message.id)
        return alreadyPresent ? withoutOptimistic : [...withoutOptimistic, result.message]
      })
      // Update the conversation list preview in-place — avoids a full refetch
      // which would trigger mark-read, creating an invalidation loop.
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations(), (old) => {
        if (!old) return old
        return old.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessagePreview: result.message.preview,
                lastMessageAt: result.message.createdAt,
              }
            : c,
        )
      })
    },

    onError: (_err, _body, context) => {
      // Roll back optimistic update
      if (context?.previous !== undefined) {
        queryClient.setQueryData(chatKeys.messages(conversationId), context.previous)
      }

      if (axios.isAxiosError(_err)) {
        const msg: string =
          (_err.response?.data as { error?: string } | undefined)?.error ??
          'Failed to send message.'
        toast.error(msg)
      } else {
        toast.error('Failed to send message.')
      }
    },
  })
}

export function useMarkConversationRead(conversationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markConversationRead(conversationId!),

    onMutate: async () => {
      if (!conversationId) return
      // Optimistically zero out the unread badge — no invalidation needed since
      // the conversations list is kept live via socket events.
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations(), (old) => {
        if (!old) return old
        return old.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      })
    },
  })
}
