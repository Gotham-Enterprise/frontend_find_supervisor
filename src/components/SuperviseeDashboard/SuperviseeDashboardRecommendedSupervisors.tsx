import { AlertCircle, MapPin, Star, Video } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { RecommendedSupervisorApiItem } from '@/lib/api/supervisors'

import { InitialsAvatar } from './SuperviseeDashboardShared'

const FORMAT_LABELS: Record<string, string> = {
  VIRTUAL: 'Virtual',
  IN_PERSON: 'In-Person',
  HYBRID: 'Hybrid',
}

const FORMAT_BADGE_CLASSES: Record<string, string> = {
  VIRTUAL: 'bg-blue-50 text-blue-700 border-blue-100',
  IN_PERSON: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  HYBRID: 'bg-violet-50 text-violet-700 border-violet-100',
}

function RecommendedSupervisorCardSkeleton() {
  return (
    <div className="flex items-start gap-3 py-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-md" />
    </div>
  )
}

interface RecommendedSupervisorRowProps {
  supervisor: RecommendedSupervisorApiItem
}

function RecommendedSupervisorRow({ supervisor }: RecommendedSupervisorRowProps) {
  const {
    id,
    fullName,
    occupation,
    supervisorProfile,
    stateOfLicensure,
    averageRating,
    totalReviews,
  } = supervisor

  const role = occupation?.name || supervisorProfile?.profession || 'Supervisor'
  const format = supervisorProfile?.supervisionFormat ?? null
  const locationLabel = stateOfLicensure.length > 0 ? stateOfLicensure.slice(0, 2).join(', ') : null
  const hasRating = averageRating > 0

  return (
    <div className="py-4">
      <div className="flex items-stretch gap-3">
        <InitialsAvatar name={fullName} className="size-10 shrink-0 self-start text-sm" />

        <div className="flex min-w-0 flex-1 gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">{fullName || '—'}</p>
            <p className="text-xs text-muted-foreground">{role}</p>

            {/* Meta row: location, format, rating */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {locationLabel && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  {locationLabel}
                </span>
              )}
              {format && (
                <span className="flex items-center gap-1">
                  <Video className="size-3 shrink-0" />
                  <span
                    className={`rounded-sm border px-1 py-0.5 text-xs font-medium ${FORMAT_BADGE_CLASSES[format] ?? ''}`}
                  >
                    {FORMAT_LABELS[format] ?? format}
                  </span>
                </span>
              )}
              {hasRating && (
                <span className="flex items-center gap-1">
                  <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                  {averageRating.toFixed(1)}
                  {totalReviews > 0 && (
                    <span className="text-muted-foreground/70">({totalReviews})</span>
                  )}
                </span>
              )}
            </div>

            {/* Specializations */}
            {supervisor.specialty && (
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {supervisor.specialty.name}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end justify-between gap-3">
            <span className="text-xs font-medium text-emerald-600">Accepting now</span>
            <Link
              href={`/find-supervisors/${id}?from=dashboard`}
              className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SuperviseeDashboardRecommendedSupervisorsProps {
  supervisors: RecommendedSupervisorApiItem[]
  isLoading: boolean
  isError: boolean
}

export function SuperviseeDashboardRecommendedSupervisors({
  supervisors,
  isLoading,
  isError,
}: SuperviseeDashboardRecommendedSupervisorsProps) {
  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Recommended for You</CardTitle>
          <p className="text-sm text-muted-foreground">Based on your supervision needs</p>
        </CardHeader>
        <CardContent className="flex-1 divide-y pt-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <RecommendedSupervisorCardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Recommended for You</CardTitle>
          <p className="text-sm text-muted-foreground">Based on your supervision needs</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="mb-2 size-8 text-destructive/50" />
          <p className="text-sm text-muted-foreground">
            Could not load recommendations. Please try again later.
          </p>
          <Link
            href="/find-supervisors"
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Browse all supervisors →
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (supervisors.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Recommended for You</CardTitle>
          <p className="text-sm text-muted-foreground">Based on your supervision needs</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Star className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No supervisors available right now.</p>
          <Link
            href="/find-supervisors"
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Browse all supervisors →
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recommended for You</CardTitle>
          <p className="text-sm text-muted-foreground">Based on your supervision needs</p>
        </div>
        <Link href="/find-supervisors" className="text-sm font-medium text-primary hover:underline">
          Browse all →
        </Link>
      </CardHeader>
      <CardContent className="flex-1 divide-y pt-0">
        {supervisors.map((supervisor) => (
          <RecommendedSupervisorRow key={supervisor.id} supervisor={supervisor} />
        ))}
      </CardContent>
    </Card>
  )
}
