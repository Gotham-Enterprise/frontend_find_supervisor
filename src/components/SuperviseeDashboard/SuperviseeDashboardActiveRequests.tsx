import { AlertCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { HireListItem, HireStatus } from '@/types/hire'

import { InitialsAvatar } from './SuperviseeDashboardShared'
import { formatRelativeTime } from './SuperviseeDashboardUtils'

const STATUS_BADGE: Record<HireStatus, { label: string; className: string }> = {
  PENDING: {
    label: '● Pending',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  ACCEPTED: {
    label: '● Accepted',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  ACTIVE: {
    label: '● Active',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  COMPLETED: {
    label: '● Completed',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  CANCELED: {
    label: '● Cancelled',
    className: 'bg-muted text-muted-foreground hover:bg-muted',
  },
  REJECTED: {
    label: '● Rejected',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  REVIEWED: {
    label: '● Reviewed',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
}

function ActiveRequestSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  )
}

interface SuperviseeDashboardActiveRequestsProps {
  hires: HireListItem[]
  isError: boolean
}

export function SuperviseeDashboardActiveRequests({
  hires,
  isError,
}: SuperviseeDashboardActiveRequestsProps) {
  if (isError) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Active Requests</CardTitle>
          <p className="text-sm text-muted-foreground">Supervisors you&apos;ve reached out to</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="mb-2 size-8 text-destructive/50" />
          <p className="text-sm text-muted-foreground">
            Could not load your requests. Please try again later.
          </p>
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

  if (hires.length === 0) {
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
        <Link
          href="/hired-supervisors"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent className="flex-1 divide-y pt-0">
        {hires.map((hire) => {
          const supervisorName = hire.supervisor?.fullName ?? '—'
          const badge = STATUS_BADGE[hire.status] ?? STATUS_BADGE.PENDING

          return (
            <div key={hire.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={supervisorName} className="size-8 text-xs" />
                <div>
                  <p className="text-sm font-medium leading-tight">{supervisorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(hire.createdAt)}
                  </p>
                </div>
              </div>
              <Badge className={`${badge.className} text-xs`}>{badge.label}</Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

/** Loading skeleton — rendered by the parent while hires data is in flight. */
export function SuperviseeDashboardActiveRequestsSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Active Requests</CardTitle>
        <p className="text-sm text-muted-foreground">Supervisors you&apos;ve reached out to</p>
      </CardHeader>
      <CardContent className="flex-1 divide-y pt-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <ActiveRequestSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  )
}
