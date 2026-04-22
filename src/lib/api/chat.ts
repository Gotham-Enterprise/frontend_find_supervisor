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

export async function createOrGetConversation(supervisorId: string) {
  const { data } = await apiClient.post<ConversationResponse>('/supervision/chat/conversations', {
    supervisorId,
  })
  return data.data
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function fetchMessages(conversationId: string, page = 1, limit = 20) {
  const { data } = await apiClient.get<MessagesResponse>(
    `/supervision/chat/conversations/${conversationId}/messages`,
    { params: { page, limit } },
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
