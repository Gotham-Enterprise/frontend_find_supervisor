'use client'

import { BookOpen, CalendarDays, MessageCircle, UserCheck } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/lib/hooks'
import { useConversations } from '@/lib/hooks/useChat'
import { cn } from '@/lib/utils'

interface SuperviseeDashboardSummaryCardsProps {
  pendingCount: number
  supervisorCount: number
  upcomingSessionsCount: number
  isUpcomingSessionsLoading: boolean
}

export function SuperviseeDashboardSummaryCards({
  pendingCount,
  supervisorCount,
  upcomingSessionsCount,
  isUpcomingSessionsLoading,
}: SuperviseeDashboardSummaryCardsProps) {
  const { user } = useUser()
  const { data: conversations, isPending: isConversationsPending } = useConversations({
    enabled: Boolean(user?.id),
  })

  const unreadMessageCount = useMemo(
    () => (conversations ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    [conversations],
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Upcoming Sessions
          </CardTitle>
          <CalendarDays className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex h-8 items-center">
            <p className="text-2xl font-bold">
              {isUpcomingSessionsLoading ? '—' : upcomingSessionsCount}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {isUpcomingSessionsLoading
              ? 'Loading…'
              : upcomingSessionsCount === 0
                ? 'None scheduled ahead'
                : `Scheduled session${upcomingSessionsCount === 1 ? '' : 's'}`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Active Requests
          </CardTitle>
          <BookOpen className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex h-8 items-center">
            <Badge
              className={cn(
                'w-fit hover:opacity-100',
                pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground',
              )}
            >
              {pendingCount > 0 ? '● Pending' : '● None'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {pendingCount === 0 ? 'No pending requests' : 'Awaiting supervisor response'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Available Supervisors
          </CardTitle>
          <UserCheck className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex h-8 items-center">
            <p className="text-2xl font-bold">{supervisorCount}</p>
          </div>
          <p className="text-xs text-muted-foreground">Accepting new supervisees</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Messages
          </CardTitle>
          <MessageCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex h-8 items-center">
            <p className="text-2xl font-bold">
              {isConversationsPending ? '—' : unreadMessageCount}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {isConversationsPending
              ? 'Loading…'
              : unreadMessageCount === 0
                ? 'No unread messages'
                : `Unread message${unreadMessageCount === 1 ? '' : 's'}`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
