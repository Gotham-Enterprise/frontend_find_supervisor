export type MessageFilter = 'unread' | 'read'

export type ParticipantRole = 'supervisor' | 'supervisee'

export interface ConversationPreview {
  id: string
  /** Display name of the other participant */
  participantName: string
  /** Their role in the platform — used for avatar color + context label */
  participantRole: ParticipantRole
  /** Most recent message body (pre-truncated or raw; the UI truncates as needed) */
  lastMessage: string
  /** Whether the current user sent the last message */
  lastMessageSender: 'me' | 'them'
  isRead: boolean
  /** When the conversation was last active */
  updatedAt: Date
  /** Number of unread messages in this thread (shown as a badge) */
  unreadCount?: number
}
