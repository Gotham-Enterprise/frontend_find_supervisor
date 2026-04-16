import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MatchingRequest } from '@/types'

import { InitialsAvatar } from './SuperviseeDashboardShared'
import { formatRelativeTime } from './SuperviseeDashboardUtils'

interface SuperviseeDashboardActiveRequestsProps {
  requests: MatchingRequest[]
}

export function SuperviseeDashboardActiveRequests({
  requests,
}: SuperviseeDashboardActiveRequestsProps) {
  if (requests.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Active Requests</CardTitle>
          <p className="text-sm text-muted-foreground">Supervisors you&apos;ve reached out to</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <MessageCircle className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No active requests yet.</p>
          <Link
            href="/find-supervisors"
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Find a supervisor →
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Active Requests</CardTitle>
          <p className="text-sm text-muted-foreground">Supervisors you&apos;ve reached out to</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 divide-y pt-0">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <InitialsAvatar name={req.supervisorName} className="size-8 text-xs" />
              <div>
                <p className="text-sm font-medium leading-tight">{req.supervisorName}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(req.createdAt)}</p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
              ● Pending
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
