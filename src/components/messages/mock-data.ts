import type { ConversationPreview } from './types'

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000)
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000)
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000)

/**
 * Demo conversation previews for the topbar Messages panel.
 *
 * Replace with a real API fetch (e.g. `GET /messages/conversations`) when the
 * messaging feature is built on the backend. The shape of each item maps
 * directly to what a conversations list endpoint would return.
 */
export const MOCK_CONVERSATIONS: ConversationPreview[] = [
  {
    id: 'c1',
    participantName: 'Dr. Maria Santos',
    participantRole: 'supervisor',
    lastMessage: "I've reviewed your case notes. Let's discuss the treatment plan on Thursday.",
    lastMessageSender: 'them',
    isRead: false,
    updatedAt: minsAgo(12),
    unreadCount: 2,
  },
  {
    id: 'c2',
    participantName: 'Jordan Lee',
    participantRole: 'supervisee',
    lastMessage:
      'Thank you for accepting my supervision request! Looking forward to working with you.',
    lastMessageSender: 'them',
    isRead: false,
    updatedAt: minsAgo(58),
    unreadCount: 1,
  },
  {
    id: 'c3',
    participantName: 'Casey Morgan',
    participantRole: 'supervisee',
    lastMessage: 'Are you available next Tuesday at 3 PM for our session?',
    lastMessageSender: 'them',
    isRead: false,
    updatedAt: hoursAgo(3),
    unreadCount: 1,
  },
  {
    id: 'c4',
    participantName: 'Dr. Emily Chen',
    participantRole: 'supervisor',
    lastMessage: "Sounds good, I'll send over the intake form before then.",
    lastMessageSender: 'me',
    isRead: true,
    updatedAt: daysAgo(1),
  },
  {
    id: 'c5',
    participantName: 'Alex Rivera',
    participantRole: 'supervisee',
    lastMessage: 'Please send me your latest progress notes when you have a chance.',
    lastMessageSender: 'me',
    isRead: true,
    updatedAt: daysAgo(2),
  },
  {
    id: 'c6',
    participantName: 'Dr. Robert Kim',
    participantRole: 'supervisor',
    lastMessage: 'Looking forward to our session next week. Reminder to review section 4.',
    lastMessageSender: 'them',
    isRead: true,
    updatedAt: daysAgo(4),
  },
]
