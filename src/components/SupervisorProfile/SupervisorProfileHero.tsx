import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DisabledWithTooltip } from '@/components/ui/tooltip'
import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/contexts/UserContext'
import { useSuperviseeProfile } from '@/lib/hooks/useSuperviseeProfile'
import { formatDisplayName, getInitials } from '@/lib/utils/profile-formatters'
import { hasActivePaidSupervisionSubscription } from '@/lib/utils/subscription-plan-resolution'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

import { HireSupervisorModal } from './HireSupervisorModal'

interface SupervisorProfileHeroProps {
  profile: SupervisorProfileData
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1l1.5 3.1 3.5.5-2.5 2.4.6 3.4L7 8.8l-3.1 1.6.6-3.4L2 4.6l3.5-.5L7 1z"
        fill={filled ? '#F59E0B' : '#E5E7EB'}
      />
    </svg>
  )
}

function ProfileAvatar({
  fullName,
  photoUrl,
}: {
  fullName: string | null | undefined
  photoUrl: string | null | undefined
}) {
  const [loadFailed, setLoadFailed] = useState(false)
  const url = photoUrl?.trim()
  const showImage = Boolean(url && !loadFailed)

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external profile URLs from API
      <img
        src={url}
        alt=""
        className="size-[88px] shrink-0 rounded-full object-cover"
        onError={() => setLoadFailed(true)}
      />
    )
  }
  return (
    <div
      className="flex size-[88px] shrink-0 items-center justify-center rounded-full bg-[#E2F0E8] text-2xl font-semibold text-[#006D36]"
      aria-hidden
    >
      {getInitials(fullName)}
    </div>
  )
}

// Dummy rating — replace with real data when the API supports reviews
const DUMMY_RATING = 4.8
const DUMMY_REVIEW_COUNT = 100

export function SupervisorProfileHero({ profile }: SupervisorProfileHeroProps) {
  const [hireModalOpen, setHireModalOpen] = useState(false)
  const { user } = useUser()
  const {
    data: superviseeProfile,
    isPending: superviseeProfileLoading,
    isError: superviseeProfileError,
  } = useSuperviseeProfile()

  const hireBlockedForSupervisee = useMemo(() => {
    if (!isSuperviseeRole(user?.role)) return false
    if (superviseeProfileLoading) return true
    if (superviseeProfileError) return true
    return !hasActivePaidSupervisionSubscription(superviseeProfile?.user.subscriptions)
  }, [
    superviseeProfile?.user.subscriptions,
    superviseeProfileError,
    superviseeProfileLoading,
    user?.role,
  ])

  const hireDisabledTooltip = superviseeProfileLoading
    ? 'Checking your subscription status…'
    : superviseeProfileError
      ? 'We could not verify your subscription. Refresh the page or try again from your dashboard.'
      : 'You need an active supervision plan subscription to hire a supervisor. Subscribe from your dashboard.'

  const displayName = formatDisplayName(profile.user)
  const occupation = profile.user.occupation?.name ?? profile.occupation?.name
  const specialty = profile.user.specialty?.name ?? profile.specialty?.name
  const subline = [occupation, specialty].filter(Boolean).join(' · ')
  const filledStars = Math.round(DUMMY_RATING)

  return (
    <>
      <div className="flex flex-col items-start gap-6 border-b border-[#E5E7EB] py-8 sm:flex-row">
        <ProfileAvatar
          key={profile.user.profilePhotoUrl ?? 'no-photo'}
          fullName={displayName}
          photoUrl={profile.user.profilePhotoUrl}
        />

        {/* Name / meta */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-[#181818]">{displayName}</h1>
            <span className="rounded-full bg-[#E2F0E8] px-2.5 py-0.5 text-xs font-medium text-[#006D36]">
              Supervisor
            </span>
          </div>

          {subline && <p className="text-sm text-[#6B7280]">{subline}</p>}

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < filledStars} />
              ))}
            </div>
            <span className="text-sm font-medium text-[#181818]">{DUMMY_RATING}</span>
            <span className="text-sm text-[#6B7280]">· {DUMMY_REVIEW_COUNT} reviews</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex shrink-0 gap-2">
          <DisabledWithTooltip tooltip={hireDisabledTooltip} disabled={hireBlockedForSupervisee}>
            <Button
              size="sm"
              disabled={hireBlockedForSupervisee}
              onClick={() => {
                if (!hireBlockedForSupervisee) setHireModalOpen(true)
              }}
            >
              Hire as Supervisor
            </Button>
          </DisabledWithTooltip>
          <Button size="sm" variant="outline">
            Message Me
          </Button>
        </div>
      </div>

      <HireSupervisorModal
        open={hireModalOpen}
        onOpenChange={setHireModalOpen}
        supervisorProfile={profile}
        superviseeProfile={superviseeProfile}
      />
    </>
  )
}
