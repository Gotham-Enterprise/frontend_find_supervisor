import { Button } from '@/components/ui/button'
import { formatDisplayName, getInitials } from '@/lib/utils/profile-formatters'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

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
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={fullName ?? 'Profile photo'}
        className="size-[88px] shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div className="flex size-[88px] shrink-0 items-center justify-center rounded-full bg-[#E2F0E8] text-2xl font-semibold text-[#006D36]">
      {getInitials(fullName)}
    </div>
  )
}

// Dummy rating — replace with real data when the API supports reviews
const DUMMY_RATING = 4.8
const DUMMY_REVIEW_COUNT = 100

export function SupervisorProfileHero({ profile }: SupervisorProfileHeroProps) {
  const displayName = formatDisplayName(profile.user)
  const occupation = profile.user.occupation?.name ?? profile.occupation?.name
  const specialty = profile.user.specialty?.name ?? profile.specialty?.name
  const subline = [occupation, specialty].filter(Boolean).join(' · ')
  const filledStars = Math.round(DUMMY_RATING)

  return (
    <div className="flex flex-col items-start gap-6 border-b border-[#E5E7EB] py-8 sm:flex-row">
      <ProfileAvatar fullName={displayName} photoUrl={profile.user.profilePhotoUrl} />

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
        <Button size="sm">Hire Me!</Button>
        <Button size="sm" variant="outline">
          Message Me
        </Button>
      </div>
    </div>
  )
}
