import type { ChatHire, Conversation } from '@/types/chat'

/**
 * Chat is one room per hire (like Upwork's one room per contract), so the
 * same two people can share several rooms. These helpers label a room by its
 * hire and pick the right one when only a person is known.
 */

const OPEN_STATUSES: ReadonlyArray<ChatHire['status']> = [
  'PENDING',
  'REVIEWED',
  'ACCEPTED',
  'ACTIVE',
]

function isOpenHire(hire: ChatHire | null): boolean {
  if (!hire) return false
  // REVIEWED after completion means "reviewed by the supervisee", not open.
  if (hire.status === 'REVIEWED') return !hire.completedAt
  return OPEN_STATUSES.includes(hire.status)
}

function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** "Supervision · Started Oct 2026", "Medical Director · Requested Mar 2026 · Declined", or "Before hire". */
export function contractLabel(hire: ChatHire | null): string {
  if (!hire) return 'Before hire'
  const kind = hire.typeOfSupervisorNeeded?.some((t) => /medical director/i.test(t))
    ? 'Medical Director'
    : 'Supervision'
  const when = hire.startDate
    ? `Started ${monthYear(hire.startDate)}`
    : hire.createdAt
      ? `Requested ${monthYear(hire.createdAt)}`
      : null
  const outcome =
    hire.status === 'COMPLETED' || (hire.status === 'REVIEWED' && hire.completedAt)
      ? 'Completed'
      : hire.status === 'CANCELED'
        ? 'Canceled'
        : hire.status === 'REJECTED'
          ? 'Declined'
          : null
  return [kind, when, outcome].filter(Boolean).join(' · ')
}

/** Whether the other person in this room also shares other rooms with the viewer. */
export function sharesSeveralRooms(conversations: Conversation[], conversation: Conversation) {
  return (
    conversations.filter(
      (c) =>
        c.supervisorId === conversation.supervisorId &&
        c.superviseeId === conversation.superviseeId,
    ).length > 1
  )
}

/** The room to open when only the person is known: an open hire's room, then the latest message. */
export function pickConversation(
  conversations: Conversation[] | undefined,
  matches: (c: Conversation) => boolean,
): Conversation | undefined {
  const rooms = (conversations ?? []).filter(matches)
  return [...rooms].sort((a, b) => {
    const open = Number(isOpenHire(b.hire)) - Number(isOpenHire(a.hire))
    if (open !== 0) return open
    return (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? '')
  })[0]
}
