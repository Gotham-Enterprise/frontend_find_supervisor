export type NotificationType =
  | 'supervision_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'request_canceled'
  | 'new_message'
  | 'session_reminder'
  | 'profile_viewed'

export type NotificationFilter = 'unread' | 'read'

export type CtaVariant = 'primary' | 'outline' | 'destructive'

export interface NotificationCta {
  label: string
  variant: CtaVariant
  /** Stable key identifying the intended action — used when wiring to a real API */
  actionKey: string
}

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  /** Optional inline action buttons rendered below the notification body */
  ctas?: NotificationCta[]
  /** ID of the related domain entity (hire, request, message thread, etc.) */
  referenceId?: string
  /** Backend redirectSlug — used to build navigation targets from notifications */
  redirectSlug?: string
}
