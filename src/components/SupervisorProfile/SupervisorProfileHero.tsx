import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DisabledWithTooltip } from '@/components/ui/tooltip'
import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/contexts/UserContext'
import {
  useConversations,
  useCreateOrGetConversation,
  useSuperviseeProfile,
  useSupervisionChatSocket,
  useSupervisorReviews,
  useSupervisorTypeOptions,
} from '@/lib/hooks'
import { useCheckConnectionAvailability } from '@/lib/hooks/useConnections'
import {
  formatDisplayName,
  formatNameWithCredentials,
  getInitials,
  getSupervisorTypeDisplayLabels,
} from '@/lib/utils/profile-formatters'
import {
  getConnectionBadgeClassName,
  getConnectionStatusLabel,
  getHireBadgeClassName,
  getHireStatusLabel,
  isAcceptedConnectionStatus,
  isApprovedHireStatus,
  isPendingConnectionStatus,
} from '@/lib/utils/supervision-status'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

import { type HireContext, HireSupervisorModal } from './HireSupervisorModal'

interface SupervisorProfileHeroProps {
  profile: SupervisorProfileData
  /** Same id as the profile URL segment — passed to GET /supervision/reviews. */
  supervisorId: string
  /** Which role is being hired — driven by the page the supervisee came from. */
  hireContext: HireContext
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

function averageRating(reviews: { rating: number }[]): number {
  if (!reviews.length) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

export function SupervisorProfileHero({
  profile,
  supervisorId,
  hireContext,
}: SupervisorProfileHeroProps) {
  const [hireModalOpen, setHireModalOpen] = useState(false)
  const { user } = useUser()
  const router = useRouter()
  const { data: superviseeProfile } = useSuperviseeProfile()
  const { mutate: createOrGetConversation, isPending: isStartingChat } =
    useCreateOrGetConversation()

  const { data: supervisorTypeOptions = [] } = useSupervisorTypeOptions()
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useSupervisorReviews(supervisorId)
  const reviewItems = reviewsData?.items ?? []
  const reviewTotalCount = reviewsData?.totalCount ?? 0
  const overallRating = averageRating(reviewItems)

  // Check if there's an existing conversation with this supervisor
  const { data: conversations } = useConversations()
  const existingConversation = conversations?.find((c) => c.supervisorId === profile.user.id)

  // Realtime messaging status — overrides static profile data when the socket fires
  const { messagingStatus } = useSupervisionChatSocket()
  const realtimeStatus = messagingStatus.get(profile.user.id)

  // Merge: socket state takes precedence over static profile data when present
  const supervisorCanMessage =
    realtimeStatus !== undefined
      ? realtimeStatus.canMessage
      : profile.user.supervisorSettings?.canMessage !== false

  const disabledMessageInfo =
    realtimeStatus?.disabledMessageInfo?.trim() ||
    profile.user.supervisorSettings?.disabledMessageInfo?.trim() ||
    null

  const isInMyHireList = profile.isInMyHireList ?? false

  // Check connection status: supervisee (current user) is the receiver of the request,
  // supervisor (profile) is the requester identified by email.
  const isSupervisee = isSuperviseeRole(user?.role)
  const { data: connectionCheckData } = useCheckConnectionAvailability(
    isSupervisee ? (user?.id ?? null) : null,
    isSupervisee ? profile.user.email : null,
  )
  const isConnectionApproved = isAcceptedConnectionStatus(connectionCheckData?.reason)

  // Messaging is unlocked by either an accepted connection OR an existing hire.
  const hasMessagingRelationship = isConnectionApproved || isInMyHireList

  // Supervisor may have disabled messaging on their account — respect that regardless.
  const supervisorMessagingDisabled = isSupervisee && !supervisorCanMessage

  const isMessageDisabled = !hasMessagingRelationship || supervisorMessagingDisabled

  const messageDisabledTooltip = (() => {
    if (!hasMessagingRelationship) {
      if (isPendingConnectionStatus(connectionCheckData?.reason)) {
        return 'You can message this supervisor once your connection request has been accepted.'
      }
      return 'You need to connect with this supervisor before messaging.'
    }
    return disabledMessageInfo ?? 'Messaging is not available for this supervisor.'
  })()

  const displayName = formatDisplayName(profile.user)
  const displayNameWithCredentials = formatNameWithCredentials(
    displayName,
    profile.professionalCredentials,
  )
  // Profile strings only — the account-level user.occupation/specialty
  // relations are jobseeker-side leftovers that can hold unrelated values
  // (e.g. "Accountant" on a physician), so they are deliberately ignored.
  const occupation = profile.supervisorOccupation?.trim()
  const specialty = profile.supervisorSpecialty?.trim()
  const subline = [occupation, specialty].filter(Boolean).join(' · ')
  // One badge per role: the primary type plus any Medical Director secondary offerings
  const roleBadgeLabels = getSupervisorTypeDisplayLabels(
    profile.supervisorType,
    profile.offerings,
    supervisorTypeOptions,
  )
  const filledStars = Math.round(overallRating)

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
            <h1 className="text-xl font-bold text-[#181818]">{displayNameWithCredentials}</h1>
            {roleBadgeLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-[#E2F0E8] px-2.5 py-0.5 text-xs font-medium text-[#006D36]"
              >
                {label}
              </span>
            ))}
          </div>

          {subline && <p className="text-sm text-[#6B7280]">{subline}</p>}

          {/* Rating — from GET /supervision/reviews (same source as Reviews section) */}
          <div className="flex min-h-[22px] items-center gap-1.5">
            {reviewsLoading && <span className="text-sm text-[#6B7280]">Loading reviews…</span>}
            {reviewsError && !reviewsLoading && (
              <span className="text-sm text-[#6B7280]">Could not load reviews.</span>
            )}
            {!reviewsLoading && !reviewsError && reviewTotalCount === 0 && (
              <span className="text-sm text-[#6B7280]">No reviews yet.</span>
            )}
            {!reviewsLoading && !reviewsError && reviewTotalCount > 0 && (
              <>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < filledStars} />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#181818]">
                  {overallRating.toFixed(1)}
                </span>
                <span className="text-sm text-[#6B7280]">
                  · {reviewTotalCount} review{reviewTotalCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          {/* Relationship status badges — only rendered for supervisees once check data loads */}
          {isSupervisee && connectionCheckData !== undefined && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={getConnectionBadgeClassName(connectionCheckData.reason)}
              >
                {getConnectionStatusLabel(connectionCheckData.reason)}
              </Badge>
              {isInMyHireList && (
                <Badge
                  variant="outline"
                  className={getHireBadgeClassName(profile.hiredInfo?.status)}
                >
                  {getHireStatusLabel(profile.hiredInfo?.status)}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex shrink-0 gap-2">
          {isInMyHireList ? (
            <span
              className="inline-flex h-9 items-center px-3 text-sm font-medium text-[#6B7280]"
              role="status"
            >
              {isApprovedHireStatus(profile.hiredInfo?.status) ? 'Hired' : 'Waiting for approval'}
            </span>
          ) : (
            <Button size="sm" onClick={() => setHireModalOpen(true)}>
              {hireContext === 'medical-director'
                ? 'Hire as Medical Director'
                : 'Hire as Supervisor'}
            </Button>
          )}
          <DisabledWithTooltip tooltip={messageDisabledTooltip} disabled={isMessageDisabled}>
            <Button
              size="sm"
              variant="outline"
              disabled={isMessageDisabled || isStartingChat}
              onClick={() => {
                if (isMessageDisabled) return
                // Navigate directly when a conversation already exists
                if (existingConversation) {
                  router.push(`/messages/${existingConversation.id}`)
                  return
                }
                // Connection-approved path: conversation was created on approval;
                // if it's not in the cache yet, fall back to the messages inbox.
                if (isConnectionApproved) {
                  router.push('/messages')
                  return
                }
                // Hire path: create or retrieve the conversation via the chat API
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
        hireContext={hireContext}
        open={hireModalOpen}
        onOpenChange={setHireModalOpen}
        supervisorProfile={profile}
        superviseeProfile={superviseeProfile}
      />
    </>
  )
}
