import { CalendarDays, Loader2, Search, Video } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UpcomingSessionItem } from '@/types/hire'

import { InitialsAvatar } from './SuperviseeDashboardShared'
import { formatUpcomingSessionDisplay } from './SuperviseeDashboardUtils'

const FORMAT_LABELS: Record<string, string> = {
  VIRTUAL: 'Video · Virtual',
  IN_PERSON: 'In-Person',
  HYBRID: 'Hybrid',
}

interface SuperviseeDashboardUpcomingSessionsCardProps {
  sessions: UpcomingSessionItem[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function SuperviseeDashboardUpcomingSessionsCard({
  sessions,
  isLoading,
  isError,
  onRetry,
}: SuperviseeDashboardUpcomingSessionsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Upcoming Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">Your next scheduled supervision sessions</p>
        </CardHeader>
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center py-12 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">Loading sessions…</p>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Upcoming Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">Your next scheduled supervision sessions</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">Could not load upcoming sessions.</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (sessions.length === 0) {
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
          <p className="font-medium text-foreground">No upcoming sessions</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When a supervisor sets a future start date, it will show here. You can still message
            supervisors from Hired Supervisors.
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

  const [next, ...rest] = sessions

  const supervisorName = next.supervisor?.fullName ?? '—'
  const sessionTypeLabel =
    FORMAT_LABELS[next.preferredFormat ?? ''] ?? next.preferredFormat ?? 'Supervision'
  const statusLabel =
    next.status === 'ACTIVE' ? 'Active' : next.status === 'ACCEPTED' ? 'Accepted' : next.status
  const whenLabel = formatUpcomingSessionDisplay(next.upcomingSessionDate)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Upcoming Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">Your next scheduled supervision sessions</p>
        </div>
        <Link
          href="/hired-supervisors"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <InitialsAvatar name={supervisorName} className="size-10 text-sm" />
              <div>
                <p className="font-semibold leading-tight">{supervisorName}</p>
                <p className="text-sm text-muted-foreground">Individual Supervision</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              ● {statusLabel}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Scheduled for
              </p>
              <p className="mt-0.5 text-sm font-medium">{whenLabel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Session Type
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
                <Video className="size-3.5 shrink-0 text-muted-foreground" /> {sessionTypeLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <p className="mt-0.5 text-sm font-medium">{statusLabel}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/find-supervisors/${next.supervisorId}?from=dashboard`}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              View Details
            </Link>
          </div>
        </div>

        {rest.length > 0 && (
          <ul className="mt-3 divide-y">
            {rest.map((hire) => {
              const name = hire.supervisor?.fullName ?? '—'
              const restWhen = formatUpcomingSessionDisplay(hire.upcomingSessionDate)
              return (
                <li
                  key={hire.id}
                  className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={name} className="size-7 text-xs" />
                    <div>
                      <span className="font-medium">{name}</span>
                      <p className="text-xs text-muted-foreground">{restWhen}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                      {hire.status === 'ACTIVE' ? 'Active' : 'Accepted'}
                    </Badge>
                    <Link
                      href={`/find-supervisors/${hire.supervisorId}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
