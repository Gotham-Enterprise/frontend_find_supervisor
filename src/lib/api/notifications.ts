import type { AppNotification, NotificationType } from '@/components/notifications/types'

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Backend response types
// ---------------------------------------------------------------------------

export interface SupervisionNotificationData {
  id: string
  type?: string
  title: string
  message: string
  redirectSlug?: string
  metadata?: unknown
  createdAt: string
  updatedAt: string
}

export interface SupervisionNotificationItem {
  id: string
  userId: string
  notificationId: string
  readAt: string | null
  notification: SupervisionNotificationData
  hasRead: boolean
  notificationAvatarUrl: string | null
}

export interface NotificationsListResponse {
  success: boolean
  message: string
  items: SupervisionNotificationItem[]
  totalCount: number
  currentPage: number
  totalPages: number
  totalNotifUnread: number
}

export interface NotificationsListData {
  notifications: AppNotification[]
  totalNotifUnread: number
  totalCount: number
  totalPages: number
  currentPage: number
}

// ---------------------------------------------------------------------------
// Type normalisation
// ---------------------------------------------------------------------------

const VALID_NOTIFICATION_TYPES = new Set<NotificationType>([
  'supervision_request',
  'request_accepted',
  'request_rejected',
  'request_canceled',
  'new_message',
  'session_reminder',
  'profile_viewed',
])

function normalizeNotificationType(raw: string | undefined): NotificationType {
  if (!raw) return 'supervision_request'
  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_') as NotificationType
  return VALID_NOTIFICATION_TYPES.has(normalized) ? normalized : 'supervision_request'
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

export function mapApiItemToAppNotification(item: SupervisionNotificationItem): AppNotification {
  return {
    id: item.id,
    type: normalizeNotificationType(item.notification.type),
    title: item.notification.title,
    message: item.notification.message,
    isRead: item.hasRead,
    createdAt: new Date(item.notification.createdAt),
    redirectSlug: item.notification.redirectSlug,
  }
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchNotifications(page = 1, limit = 20): Promise<NotificationsListData> {
  const { data } = await apiClient.get<NotificationsListResponse>('/supervision/notifications', {
    params: { page, limit },
  })

  return {
    notifications: (data.items ?? []).map(mapApiItemToAppNotification),
    totalNotifUnread: data.totalNotifUnread,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    currentPage: data.currentPage,
  }
}

export async function markNotificationRead(recipientId: string): Promise<void> {
  await apiClient.patch(`/supervision/notifications/${recipientId}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/supervision/notifications/all-read')
}
