import type {
  ConversationResponse,
  ConversationsResponse,
  MarkReadResponse,
  MessagesResponse,
  SendMessageResponse,
} from '@/types/chat'

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function fetchConversations() {
  const { data } = await apiClient.get<ConversationsResponse>('/supervision/chat/conversations')
  return data.data
}

/**
 * A hire's message room (one per hire, like an Upwork contract). Pass
 * `{ hireId }` from a hire (either party), or a supervisor id from the
 * supervisee's side to open their latest hire with that supervisor.
 */
export async function createOrGetConversation(target: string | { hireId: string }) {
  const body = typeof target === 'string' ? { supervisorId: target } : { hireId: target.hireId }
  const { data } = await apiClient.post<ConversationResponse>(
    '/supervision/chat/conversations',
    body,
  )
  return data.data
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/** Oldest-first. `before` (a message id) returns the messages older than it. */
export async function fetchMessages(conversationId: string, page = 1, limit = 20, before?: string) {
  const { data } = await apiClient.get<MessagesResponse>(
    `/supervision/chat/conversations/${conversationId}/messages`,
    { params: before ? { limit, before } : { page, limit } },
  )
  return data.data
}

export async function sendMessage(conversationId: string, body: string) {
  const { data } = await apiClient.post<SendMessageResponse>(
    `/supervision/chat/conversations/${conversationId}/messages`,
    { body },
  )
  return data.data
}

export async function markConversationRead(conversationId: string) {
  const { data } = await apiClient.patch<MarkReadResponse>(
    `/supervision/chat/conversations/${conversationId}/read`,
  )
  return data.data
}
