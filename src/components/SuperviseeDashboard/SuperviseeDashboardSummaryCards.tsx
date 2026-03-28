import { BookOpen, CalendarDays, MessageCircle, UserCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SuperviseeDashboardSummaryCardsProps {
  pendingCount: number
  acceptedCount: number
  supervisorCount: number
}

export function SuperviseeDashboardSummaryCards({
  pendingCount,
  acceptedCount,
  supervisorCount,
}: SuperviseeDashboardSummaryCardsProps) {
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
          <p className="text-2xl font-bold">{acceptedCount}</p>
          <p className="text-xs text-muted-foreground">
            {acceptedCount === 0 ? 'No sessions scheduled' : 'Active supervision sessions'}
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
          <Badge
            className={cn(
              'text-sm hover:opacity-100',
              pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground',
            )}
          >
            {pendingCount > 0 ? '● Pending' : '● None'}
          </Badge>
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
          <p className="text-2xl font-bold">{supervisorCount}</p>
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
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
