import { AlertCircle } from 'lucide-react'

import { ProfileDetailRow, ProfilePreviewCard, TagList } from '@/components/Dashboard/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  WITHIN_2_WEEKS: 'Within 2 weeks',
  WITHIN_1_MONTH: 'Within 1 month',
  WITHIN_2_MONTHS: 'Within 3 months',
  WITHIN_6_MONTHS: 'Just exploring',
  CUSTOM_DATE: 'Custom date',
}

function formatHowSoon(
  value: string | null | undefined,
  lookingDate: string | null | undefined,
): string {
  if (!value) return 'N/A'
  if (value === 'CUSTOM_DATE') {
    if (!lookingDate) return 'Custom date'
    return new Date(lookingDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
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
  onEditClick: () => void
}

export function SuperviseeDashboardProfileDetails({
  profile,
  onEditClick,
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
  const howSoonLabel = formatHowSoon(profile.howSoonLooking, profile.lookingDate)
  const budgetLabel = formatBudget(
    profile.budgetRangeType,
    profile.budgetRangeStart,
    profile.budgetRangeEnd,
  )

  return (
    <ProfilePreviewCard
      className="h-full"
      title="My Profile"
      description="Your supervisee profile details"
      headerAction={
        <button
          type="button"
          onClick={onEditClick}
          className="text-sm font-medium text-primary hover:underline"
        >
          Edit Profile →
        </button>
      }
      avatar={{ fullName: displayName, photoUrl: profile.user.profilePhotoUrl, size: 'lg' }}
      identity={{
        name: displayName,
        subline: subline || undefined,
        meta: location !== 'N/A' ? location : undefined,
        badge: profile.user.emailVerified ? (
          <Badge className="bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100">
            ✓ Email Verified
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-xs text-amber-700 hover:bg-amber-100">
            Email Unverified
          </Badge>
        ),
      }}
      stats={[
        { value: profile.completedCount, label: 'Completed' },
        { value: profile.stateTheyAreLookingIn ?? '—', label: 'Looking In' },
        { value: formatLabel !== 'N/A' ? formatLabel : '—', label: 'Format' },
      ]}
    >
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

      {/* Ideal supervisor description */}
      {profile.idealSupervisor && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ideal Supervisor
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
            {profile.idealSupervisor}
          </p>
        </div>
      )}
    </ProfilePreviewCard>
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
