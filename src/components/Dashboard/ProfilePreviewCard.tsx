import type { ReactNode } from 'react'

import { ProfileAvatar, type ProfileAvatarProps } from '@/components/Dashboard/ProfileAvatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ProfilePreviewStat {
  value: ReactNode
  label: string
}

export interface ProfilePreviewCardProps {
  title: string
  description?: string
  headerAction?: ReactNode
  avatar: {
    fullName: ProfileAvatarProps['fullName']
    photoUrl: ProfileAvatarProps['photoUrl']
    size?: ProfileAvatarProps['size']
  }
  identity: {
    name: ReactNode
    subline?: ReactNode
    meta?: ReactNode
    badge?: ReactNode
  }
  /** Up to three columns; extra items are ignored. */
  stats?: ProfilePreviewStat[]
  children?: ReactNode
  className?: string
}

/**
 * Shared “profile summary” card: header, avatar + identity, optional 3-column stats, then custom body.
 * Used on supervisee and supervisor dashboards for consistent layout.
 */
export function ProfilePreviewCard({
  title,
  description,
  headerAction,
  avatar,
  identity,
  stats,
  children,
  className,
}: ProfilePreviewCardProps) {
  const avatarSize = avatar.size ?? 'lg'
  const statItems = stats?.slice(0, 3) ?? []
  const statCount = statItems.length

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 pt-4">
        <div className="flex items-start gap-3">
          <ProfileAvatar fullName={avatar.fullName} photoUrl={avatar.photoUrl} size={avatarSize} />
          <div className="min-w-0">
            <div className="font-semibold leading-tight">{identity.name}</div>
            {identity.subline ? (
              <p className="text-sm text-muted-foreground">{identity.subline}</p>
            ) : null}
            {identity.meta ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{identity.meta}</p>
            ) : null}
            {identity.badge ? <div className="mt-1">{identity.badge}</div> : null}
          </div>
        </div>

        {statCount > 0 ? (
          <div
            className={cn(
              'grid divide-x rounded-lg border text-center text-sm',
              statCount === 1 && 'grid-cols-1',
              statCount === 2 && 'grid-cols-2',
              statCount >= 3 && 'grid-cols-3',
            )}
          >
            {statItems.map((s, i) => (
              <div key={`${String(s.label)}-${i}`} className="py-2">
                <p className="font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {children}
      </CardContent>
    </Card>
  )
}
