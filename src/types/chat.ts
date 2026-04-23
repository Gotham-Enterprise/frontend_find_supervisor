export type ConversationStatus = 'OPEN' | 'CLOSED'

export type ChatHireStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELED'
  | 'REJECTED'

export interface ChatParticipant {
  id: string
  fullName: string
  firstName: string
  lastName: string
  profilePhotoUrl: string | null
}

export interface ChatHire {
  id: string
  status: ChatHireStatus
}

export interface Conversation {
  id: string
  supervisorId: string
  superviseeId: string
  hireId: string
  status: ConversationStatus
  lastMessageAt: string | null
  lastMessagePreview: string | null
  superviseeUnreadCount: number
  supervisorUnreadCount: number
  unreadCount: number
  remainingMessages: number
  locked: boolean
  supervisor: ChatParticipant
  supervisee: ChatParticipant
  hire: ChatHire
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  messageType: string
  body: string | null
  preview: string
  locked: boolean
  isRead: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── API response shapes ────────────────────────────────────────────────────

export interface ConversationsResponse {
  success: boolean
  data: Conversation[]
}

export interface ConversationResponse {
  success: boolean
  data: Conversation
}

export interface MessagesResponse {
  success: boolean
  data: ChatMessage[]
}

export interface SendMessageResponse {
  success: boolean
  data: {
    message: ChatMessage
    recipientId: string
    unreadCount: number
  }
}

export interface MarkReadResponse {
  success: boolean
  message: string
  data: {
    unreadCount: number
  }
}

// ─── Socket payloads ────────────────────────────────────────────────────────

export interface SocketNewMessage {
  id: string
  conversationId: string
  senderId: string
  body: string
  preview: string
  createdAt: string
}

export interface SocketUnreadCount {
  count: number
}

export interface SocketNotification {
  conversationId: string
  preview: string
  unreadCount: number
  senderId: string
}

export interface SocketReadPayload {
  conversationId: string
  readerId: string
}

export interface SocketTypingPayload {
  conversationId: string
  userId: string
  isTyping: boolean
}
