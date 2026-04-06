import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { ProfileAvatar, ProfileDetailRow, TagList } from '@/components/Dashboard/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAvailabilityOptions, useSupervisorTypeOptions } from '@/lib/hooks'
import { formatUSPhoneForDisplay } from '@/lib/utils/phone'
import {
  formatDisplayName,
  formatLocation,
  formatSupervisionFormat,
  resolveOptionLabel,
} from '@/lib/utils/profile-formatters'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

// ─── Formatters specific to the supervisee domain ────────────────────────────

const HOW_SOON_LABELS: Record<string, string> = {
  IMMEDIATELY: 'As soon as possible',
  WITHIN_1_MONTH: 'Within 1 month',
  WITHIN_2_MONTHS: 'Within 3 months',
  WITHIN_6_MONTHS: 'Just exploring',
}

function formatHowSoon(value: string | null | undefined): string {
  if (!value) return 'N/A'
  return HOW_SOON_LABELS[value] ?? value
}

function formatBudget(
  type: string | null | undefined,
  start: number | null | undefined,
  end: number | null | undefined,
): string {
  if (type == null && start == null) return 'N/A'
  const suffix = type === 'MONTHLY' ? '/month' : '/session'
  if (start === 0 && end === 0) return `Open to discussion (${suffix.slice(1)})`
  if (start != null && end != null && (start > 0 || end > 0)) return `$${start} – $${end} ${suffix}`
  return 'N/A'
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function SuperviseeDashboardProfileDetailsSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SuperviseeDashboardProfileDetailsProps {
  profile: SuperviseeProfileData
}

export function SuperviseeDashboardProfileDetails({
  profile,
}: SuperviseeDashboardProfileDetailsProps) {
  const { data: availabilityOptions = [] } = useAvailabilityOptions()
  const { data: supervisorTypeOptions = [] } = useSupervisorTypeOptions()

  const displayName = formatDisplayName(profile.user)
  const location = formatLocation(profile.user.city, profile.user.state, profile.user.zipcode)
  const occupation = profile.occupation?.name ?? profile.user.occupation?.name
  const specialty = profile.specialty?.name ?? profile.user.specialty?.name
  const subline = [occupation, specialty].filter(Boolean).join(' · ')
  const statesOfLicensure = profile.user.stateOfLicensure ?? []

  const availabilityLabel = resolveOptionLabel(profile.availability, availabilityOptions)
  const supervisorTypeLabel = resolveOptionLabel(
    profile.typeOfSupervisorNeeded,
    supervisorTypeOptions,
  )
  const formatLabel = formatSupervisionFormat(profile.preferredFormat)
  const howSoonLabel = formatHowSoon(profile.howSoonLooking)
  const budgetLabel = formatBudget(
    profile.budgetRangeType,
    profile.budgetRangeStart,
    profile.budgetRangeEnd,
  )

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">My Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Your supervisee profile details</p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          Edit Profile →
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 pt-4">
        {/* Identity */}
        <div className="flex items-start gap-3">
          <ProfileAvatar fullName={displayName} photoUrl={profile.user.profilePhotoUrl} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold leading-tight">{displayName}</p>
            {subline && <p className="text-sm text-muted-foreground">{subline}</p>}
            {location !== 'N/A' && (
              <p className="mt-0.5 text-xs text-muted-foreground">{location}</p>
            )}
            {profile.user.emailVerified ? (
              <Badge className="mt-1 bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100">
                ✓ Email Verified
              </Badge>
            ) : (
              <Badge className="mt-1 bg-amber-100 text-xs text-amber-700 hover:bg-amber-100">
                Email Unverified
              </Badge>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x rounded-lg border text-center text-sm">
          <div className="py-2">
            <p className="font-semibold">{profile.completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="py-2">
            <p className="font-semibold">{profile.stateTheyAreLookingIn ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Looking In</p>
          </div>
          <div className="py-2">
            <p className="font-semibold">{formatLabel !== 'N/A' ? formatLabel : '—'}</p>
            <p className="text-xs text-muted-foreground">Format</p>
          </div>
        </div>

        {/* Supervision Needs */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Supervision Needs
          </p>
          <div>
            {profile.typeOfSupervisorNeeded && (
              <ProfileDetailRow label="Supervisor Type">{supervisorTypeLabel}</ProfileDetailRow>
            )}
            {profile.availability && (
              <ProfileDetailRow label="Availability">{availabilityLabel}</ProfileDetailRow>
            )}
            {profile.howSoonLooking && (
              <ProfileDetailRow label="How Soon">{howSoonLabel}</ProfileDetailRow>
            )}
            {(profile.budgetRangeType || profile.budgetRangeStart != null) && (
              <ProfileDetailRow label="Budget">{budgetLabel}</ProfileDetailRow>
            )}
            {profile.user.contactNumber && (
              <ProfileDetailRow label="Contact">
                {formatUSPhoneForDisplay(profile.user.contactNumber)}
              </ProfileDetailRow>
            )}
          </div>
        </div>

        {/* States of Licensure */}
        {statesOfLicensure.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              States of Licensure
            </p>
            <TagList values={statesOfLicensure} />
          </div>
        )}

        {/* About / Ideal Supervisor */}
        {profile.idealSupervisor && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
              {profile.idealSupervisor}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

export function SuperviseeDashboardProfileDetailsError() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <AlertCircle className="mb-2 size-8 text-muted-foreground/40" />
        <p className="text-sm font-medium">Profile unavailable</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Could not load your profile details. Please refresh.
        </p>
      </CardContent>
    </Card>
  )
}
