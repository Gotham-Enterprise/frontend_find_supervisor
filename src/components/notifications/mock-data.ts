import type { AppNotification } from './types'

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000)
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000)
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000)

/**
 * Demo notifications for both Supervisor and Supervisee roles.
 *
 * Replace with a real API fetch (e.g. `GET /notifications`) when the
 * notifications feature is built on the backend.
 */
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'supervision_request',
    title: 'New Supervision Request',
    message: 'Jordan Lee has requested you as their clinical supervisor.',
    isRead: false,
    createdAt: minsAgo(8),
    ctas: [
      { label: 'Accept', variant: 'primary', actionKey: 'accept_request' },
      { label: 'Reject', variant: 'outline', actionKey: 'reject_request' },
    ],
    referenceId: 'req_001',
  },
  {
    id: 'n2',
    type: 'new_message',
    title: 'New Message',
    message:
      'Dr. Maria Santos: "I\'ve updated the session notes from Tuesday. Can you review before our next call?"',
    isRead: false,
    createdAt: minsAgo(45),
    referenceId: 'msg_thread_002',
  },
  {
    id: 'n3',
    type: 'session_reminder',
    title: 'Upcoming Session Tomorrow',
    message: 'You have a supervision session with Alex Rivera scheduled for tomorrow at 2:00 PM.',
    isRead: false,
    createdAt: hoursAgo(2),
    referenceId: 'session_003',
  },
  {
    id: 'n4',
    type: 'supervision_request',
    title: 'New Supervision Request',
    message: 'Casey Morgan is seeking a supervisor specializing in CBT and trauma-informed care.',
    isRead: false,
    createdAt: hoursAgo(5),
    ctas: [
      { label: 'Accept', variant: 'primary', actionKey: 'accept_request' },
      { label: 'Reject', variant: 'outline', actionKey: 'reject_request' },
    ],
    referenceId: 'req_004',
  },
  {
    id: 'n5',
    type: 'request_accepted',
    title: 'Supervision Request Accepted',
    message:
      'Dr. Emily Chen has accepted your supervision request. You can now message them directly.',
    isRead: true,
    createdAt: daysAgo(1),
    referenceId: 'req_005',
  },
  {
    id: 'n6',
    type: 'profile_viewed',
    title: 'Profile Activity',
    message: 'Your supervisor profile was viewed by 3 supervisees this week.',
    isRead: true,
    createdAt: daysAgo(2),
  },
  {
    id: 'n7',
    type: 'request_rejected',
    title: 'Supervision Request Declined',
    message: 'Dr. Robert Kim is not accepting new supervisees at this time.',
    isRead: true,
    createdAt: daysAgo(3),
    referenceId: 'req_007',
  },
  {
    id: 'n8',
    type: 'request_canceled',
    title: 'Request Withdrawn',
    message: 'Taylor Brooks has withdrawn their supervision request.',
    isRead: true,
    createdAt: daysAgo(4),
    referenceId: 'req_008',
  },
]
