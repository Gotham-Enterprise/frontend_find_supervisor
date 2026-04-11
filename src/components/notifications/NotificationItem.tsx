'use client'

import {
  Calendar,
  CheckCircle2,
  Eye,
  MessageCircle,
  MinusCircle,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { AppNotification, NotificationType } from './types'
import { formatRelativeTime } from './utils'

interface TypeConfig {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  supervision_request: {
    icon: UserCheck,
    iconColor: 'text-primary',
    iconBg: 'bg-brand-light',
  },
  request_accepted: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  request_rejected: {
    icon: XCircle,
    iconColor: 'text-destructive',
    iconBg: 'bg-destructive/10',
  },
  request_canceled: {
    icon: MinusCircle,
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted',
  },
  new_message: {
    icon: MessageCircle,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  session_reminder: {
    icon: Calendar,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  profile_viewed: {
    icon: Eye,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50',
  },
}

/** Label shown after the user takes an inline CTA action */
const ACTION_CONFIRMATION: Record<string, string> = {
  accept_request: 'Request accepted',
  reject_request: 'Request rejected',
}

interface NotificationItemProps {
  notification: AppNotification
  /** Called when the user clicks an inline CTA button */
  onAction: (notificationId: string, actionKey: string) => void
  /** The actionKey that was already taken on this notification, if any */
  actedKey?: string
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onAction,
  actedKey,
}: NotificationItemProps) {
  const { id, type, title, message, isRead, createdAt, ctas } = notification
  const config = TYPE_CONFIG[type]
  const Icon = config.icon

  const showCtas = Boolean(ctas?.length) && !actedKey
  const confirmationLabel = actedKey ? (ACTION_CONFIRMATION[actedKey] ?? 'Action taken') : null

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 transition-colors hover:bg-muted/40',
        !isRead && 'bg-brand-light/20',
      )}
    >
      {/* Type icon */}
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          config.iconBg,
        )}
      >
        <Icon className={cn('h-4 w-4', config.iconColor)} />
      </div>

      <div className="min-w-0 flex-1">
        {/* Title + timestamp + unread dot */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug',
              isRead ? 'font-medium text-foreground/80' : 'font-semibold text-foreground',
            )}
          >
            {title}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {formatRelativeTime(createdAt)}
            </span>
            {!isRead && (
              <span aria-label="Unread" className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
        </div>

        {/* Message body */}
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
          {message}
        </p>

        {/* Inline CTA buttons */}
        {showCtas && ctas && (
          <div className="mt-2 flex flex-wrap gap-2">
            {ctas.map((cta) => (
              <Button
                key={cta.actionKey}
                size="xs"
                variant={
                  cta.variant === 'primary'
                    ? 'default'
                    : cta.variant === 'destructive'
                      ? 'destructive'
                      : 'outline'
                }
                onClick={() => onAction(id, cta.actionKey)}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        )}

        {/* Post-action confirmation */}
        {confirmationLabel && (
          <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">
            {confirmationLabel}
          </p>
        )}
      </div>
    </div>
  )
})
