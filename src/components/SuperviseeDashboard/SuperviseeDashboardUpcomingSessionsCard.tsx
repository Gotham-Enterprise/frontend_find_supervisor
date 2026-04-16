import { CalendarDays, Search, Video } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MatchingRequest } from '@/types'

import { InitialsAvatar } from './SuperviseeDashboardShared'
import { formatRelativeTime } from './SuperviseeDashboardUtils'

interface SuperviseeDashboardUpcomingSessionsCardProps {
  requests: MatchingRequest[]
}

export function SuperviseeDashboardUpcomingSessionsCard({
  requests,
}: SuperviseeDashboardUpcomingSessionsCardProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Upcoming Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">Your next scheduled supervision sessions</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No sessions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Once a supervisor accepts your request, sessions will appear here.
          </p>
          <Link
            href="/find-supervisors"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search className="size-4" />
            Find a Supervisor
          </Link>
        </CardContent>
      </Card>
    )
  }

  const [next, ...rest] = requests

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Upcoming Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">Your next scheduled supervision sessions</p>
        </div>
        <Link href="/sessions" className="text-sm font-medium text-primary hover:underline">
          View all →
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <InitialsAvatar name={next.supervisorName} className="size-10 text-sm" />
              <div>
                <p className="font-semibold leading-tight">{next.supervisorName}</p>
                <p className="text-sm text-muted-foreground">Individual Supervision</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              ● Accepted
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Requested
              </p>
              <p className="mt-0.5 text-sm font-medium">{formatRelativeTime(next.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Session Type
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
                <Video className="size-3.5 text-muted-foreground" /> Video · Virtual
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <p className="mt-0.5 text-sm font-medium capitalize">{next.status}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/find-supervisors/${next.supervisorId}`}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              View Details
            </Link>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Join Session
            </button>
          </div>
        </div>

        {rest.length > 0 && (
          <ul className="mt-3 divide-y">
            {rest.map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={req.supervisorName} className="size-7 text-xs" />
                  <span className="font-medium">{req.supervisorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                    Accepted
                  </Badge>
                  <Link
                    href={`/find-supervisors/${req.supervisorId}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
