import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DisabledWithTooltip } from '@/components/ui/tooltip'
import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/contexts/UserContext'
import { useConversations, useCreateOrGetConversation } from '@/lib/hooks/useChat'
import { useSuperviseeProfile } from '@/lib/hooks/useSuperviseeProfile'
import { formatDisplayName, getInitials } from '@/lib/utils/profile-formatters'
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
  const router = useRouter()
  const { data: superviseeProfile } = useSuperviseeProfile()
  const { mutate: createOrGetConversation, isPending: isStartingChat } =
    useCreateOrGetConversation()

  // Check if there's an existing conversation with this supervisor (requires a hire to exist)
  const { data: conversations } = useConversations()
  const existingConversation = conversations?.find((c) => c.supervisorId === profile.user.id)

  // Message is only blocked by the supervisor's own messaging settings, not by subscription.
  const supervisorCanMessage = profile.user.supervisorSettings?.canMessage !== false
  // Only supervisees can message from the profile page; always disabled for non-supervisees.
  // Also disabled if messaging is turned off for this supervisor.
  const messageDisabled = isSuperviseeRole(user?.role) ? !supervisorCanMessage : false

  // If no hire exists with this supervisor, messaging requires hiring first.
  const noHireExists =
    isSuperviseeRole(user?.role) && !existingConversation && conversations !== undefined

  const messageDisabledTooltip = noHireExists
    ? 'You need to submit a hire request before messaging this supervisor.'
    : profile.user.supervisorSettings?.disabledMessageInfo?.trim() ||
      'Messaging is not available for this supervisor.'

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
          <Button size="sm" onClick={() => setHireModalOpen(true)}>
            Hire as Supervisor
          </Button>
          <DisabledWithTooltip
            tooltip={messageDisabledTooltip}
            disabled={messageDisabled || noHireExists}
          >
            <Button
              size="sm"
              variant="outline"
              disabled={messageDisabled || noHireExists || isStartingChat}
              onClick={() => {
                if (messageDisabled || noHireExists) return
                // If a conversation already exists, navigate directly without hitting the API
                if (existingConversation) {
                  router.push(`/messages/${existingConversation.id}`)
                  return
                }
                createOrGetConversation(profile.user.id, {
                  onSuccess: (conversation) => {
                    router.push(`/messages/${conversation.id}`)
                  },
                })
              }}
            >
              {isStartingChat ? 'Opening…' : 'Message'}
            </Button>
          </DisabledWithTooltip>
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
