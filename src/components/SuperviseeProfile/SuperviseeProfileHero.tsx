'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DisabledWithTooltip } from '@/components/ui/tooltip'
import { useConversations } from '@/lib/hooks'
import { formatDisplayName, getInitials } from '@/lib/utils/profile-formatters'
import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

interface SuperviseeProfileHeroProps {
  profile: SuperviseeProfileViewData
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

function hireStatusLabel(status: string | undefined): string | null {
  switch (status) {
    case 'PENDING':
      return 'Request pending'
    case 'REVIEWED':
      return 'Under review'
    case 'ACCEPTED':
    case 'ACTIVE':
      return 'Active supervisee'
    case 'COMPLETED':
      return 'Completed supervision'
    default:
      return status ? status.replace(/_/g, ' ').toLowerCase() : null
  }
}

export function SuperviseeProfileHero({ profile }: SuperviseeProfileHeroProps) {
  const router = useRouter()
  const { data: conversations } = useConversations()

  const user = profile.user
  const displayName = formatDisplayName(user)
  const occupation = user.occupation?.name ?? profile.superviseeOccupation
  const specialty = user.specialty?.name ?? profile.superviseeSpecialty
  const subline = [occupation, specialty].filter(Boolean).join(' · ')
  const roleBadgeLabel = profile.title?.trim() || 'Supervisee'

  const existingConversation = conversations?.find((c) => c.superviseeId === user.id)
  const isInMyHireList = profile.isInMyHireList ?? false
  const hireStatus = hireStatusLabel(profile.hiredInfo?.status)
  const canMessage = (profile.canMessage ?? false) && !!existingConversation

  const messageDisabledTooltip = !isInMyHireList
    ? 'You can message this supervisee after they send you a supervision request.'
    : !existingConversation
      ? 'Open Messages once a conversation exists for this supervisee.'
      : 'Messaging is not available for this supervisee.'

  return (
    <div className="flex flex-col items-start gap-6 border-b border-[#E5E7EB] py-8 sm:flex-row">
      <ProfileAvatar
        key={user.profilePhotoUrl ?? 'no-photo'}
        fullName={displayName}
        photoUrl={user.profilePhotoUrl}
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-[#181818]">{displayName}</h1>
          <span className="rounded-full bg-[#E2F0E8] px-2.5 py-0.5 text-xs font-medium text-[#006D36]">
            {roleBadgeLabel}
          </span>
        </div>

        {subline && <p className="text-sm text-[#6B7280]">{subline}</p>}
      </div>

      <div className="flex shrink-0 gap-2">
        {isInMyHireList && hireStatus && (
          <span
            className="inline-flex h-9 items-center px-3 text-sm font-medium text-[#6B7280]"
            role="status"
          >
            {hireStatus}
          </span>
        )}
        <DisabledWithTooltip tooltip={messageDisabledTooltip} disabled={!canMessage}>
          <Button
            size="sm"
            variant="outline"
            disabled={!canMessage}
            onClick={() => {
              if (!existingConversation) return
              router.push(`/messages/${existingConversation.id}`)
            }}
          >
            Message
          </Button>
        </DisabledWithTooltip>
      </div>
    </div>
  )
}
