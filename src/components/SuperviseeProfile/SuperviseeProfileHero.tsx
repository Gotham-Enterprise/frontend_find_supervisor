'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { SubscriptionModal } from '@/components/Dashboard/subscription/SubscriptionModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DisabledWithTooltip } from '@/components/ui/tooltip'
import { isSupervisorRole } from '@/lib/auth/roles'
import { useConversations, useSupervisorProfile, useUser, useUserSnackbar } from '@/lib/hooks'
import { useCheckConnectionAvailability } from '@/lib/hooks/useConnections'
import { getMakeConnectionAccess } from '@/lib/utils/make-connection-access'
import { formatDisplayName, getInitials } from '@/lib/utils/profile-formatters'
import {
  getConnectionBadgeClassName,
  getConnectionStatusLabel,
  getHireBadgeClassName,
  getHireStatusLabel,
  isAcceptedConnectionStatus,
} from '@/lib/utils/supervision-status'
import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

import { MakeConnectionModal } from './MakeConnectionModal'

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

// ─── Connection button label / disabled ───────────────────────────────────────

type ConnectionButtonState =
  | { label: string; disabled: true; tooltip: string }
  | { label: string; disabled: false; tooltip: '' }

function resolveConnectionButtonState(
  connectionAccess: ReturnType<typeof getMakeConnectionAccess>,
  checkIsLoading: boolean,
  checkError: boolean,
  canRequest: boolean | undefined,
  reason: string | null | undefined,
): ConnectionButtonState {
  // While access details are still loading, show a disabled button
  if (connectionAccess.allowed === false && connectionAccess.reason === 'loading') {
    return { label: 'Make A Connection', disabled: true, tooltip: 'Loading your account details…' }
  }

  // If the user cannot access (no subscription, not supervisor, etc.) — active/clickable
  // so the hero's handleClick can show the appropriate prompt
  if (!connectionAccess.allowed) {
    return { label: 'Make A Connection', disabled: false, tooltip: '' }
  }

  // Access is allowed — check availability result
  if (checkIsLoading) {
    return { label: 'Make A Connection', disabled: false, tooltip: '' }
  }

  // If check failed silently, still allow the submit (409 is handled on submit)
  if (checkError || canRequest === undefined) {
    return { label: 'Make A Connection', disabled: false, tooltip: '' }
  }

  if (!canRequest) {
    switch (reason) {
      case 'ALREADY_APPROVED':
        return {
          label: 'Connected',
          disabled: true,
          tooltip: 'This connection request was already approved.',
        }
      case 'PENDING_REQUEST_EXISTS':
      case 'COOLDOWN_ACTIVE':
      default:
        return {
          label: 'Request Sent',
          disabled: true,
          tooltip: 'You already sent a connection request to this professional.',
        }
    }
  }

  return { label: 'Make A Connection', disabled: false, tooltip: '' }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SuperviseeProfileHero({ profile }: SuperviseeProfileHeroProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user: authUser } = useUser()
  const { showInfo } = useUserSnackbar()
  const [connectionModalOpen, setConnectionModalOpen] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const { data: conversations } = useConversations()
  const { data: supervisorProfile, isLoading: supervisorProfileLoading } = useSupervisorProfile()

  const user = profile.user
  const displayName = formatDisplayName(user)
  const occupation = user.occupation?.name ?? profile.superviseeOccupation
  const specialty = user.specialty?.name ?? profile.superviseeSpecialty
  const subline = [occupation, specialty].filter(Boolean).join(' · ')
  const roleBadgeLabel = profile.title?.trim() || 'Supervisee'

  const existingConversation = conversations?.find((c) => c.superviseeId === user.id)
  const isInMyHireList = profile.isInMyHireList ?? false

  const connectionAccess = useMemo(
    () =>
      getMakeConnectionAccess({
        user: authUser,
        supervisorProfile,
        profileLoading: supervisorProfileLoading,
      }),
    [authUser, supervisorProfile, supervisorProfileLoading],
  )

  // Only call the check endpoint when access is allowed (logged in + subscription)
  const checkEnabled = connectionAccess.allowed && isSupervisorRole(authUser?.role)
  const {
    data: checkData,
    isLoading: checkLoading,
    isError: checkError,
  } = useCheckConnectionAvailability(
    checkEnabled ? user.id : null,
    checkEnabled ? (authUser?.email ?? null) : null,
  )

  const isConnectionApproved = isAcceptedConnectionStatus(checkData?.reason)

  // Messaging requires a conversation to navigate to, plus either an accepted
  // connection (connection flow) or profile.canMessage (hire flow).
  const canMessage =
    !!existingConversation && (isConnectionApproved || (profile.canMessage ?? false))

  const showMakeConnectionButton = isSupervisorRole(authUser?.role)

  const {
    label: connectionButtonLabel,
    disabled: connectionButtonDisabled,
    tooltip: connectionButtonTooltip,
  } = resolveConnectionButtonState(
    connectionAccess,
    checkLoading,
    checkError,
    checkData?.canRequest,
    checkData?.reason,
  )

  // Tooltip is only rendered while the Message button is disabled.
  const messageDisabledTooltip =
    isConnectionApproved && !existingConversation
      ? 'Connection accepted. Open Messages to find this conversation.'
      : 'You can message this supervisee once your connection request has been accepted.'

  function handleMakeConnectionClick() {
    if (connectionAccess.allowed) {
      setConnectionModalOpen(true)
      return
    }

    switch (connectionAccess.reason) {
      case 'logged_out': {
        const redirect = encodeURIComponent(pathname)
        router.push(`/login?redirect=${redirect}`)
        break
      }
      case 'no_subscription':
        showInfo('Make A Connection requires an active subscription.', {
          description: 'Upgrade your plan to introduce yourself to supervisees.',
        })
        setPlanModalOpen(true)
        break
      case 'loading':
      case 'not_supervisor':
      default:
        break
    }
  }

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

        {/* Relationship status badges — rendered for supervisors once check data loads */}
        {(checkData !== undefined || isInMyHireList) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {checkData !== undefined && (
              <Badge variant="outline" className={getConnectionBadgeClassName(checkData.reason)}>
                {getConnectionStatusLabel(checkData.reason)}
              </Badge>
            )}
            {isInMyHireList && (
              <Badge variant="outline" className={getHireBadgeClassName(profile.hiredInfo?.status)}>
                {getHireStatusLabel(profile.hiredInfo?.status)}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
        {showMakeConnectionButton && (
          <DisabledWithTooltip
            tooltip={connectionButtonTooltip}
            disabled={connectionButtonDisabled}
          >
            <Button
              size="sm"
              variant="outline"
              disabled={connectionButtonDisabled}
              onClick={handleMakeConnectionClick}
            >
              {connectionButtonLabel}
            </Button>
          </DisabledWithTooltip>
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

      <MakeConnectionModal
        open={connectionModalOpen}
        onOpenChange={setConnectionModalOpen}
        superviseeId={user.id}
        superviseeName={displayName}
        canAccess={connectionAccess.allowed}
      />

      <SubscriptionModal open={planModalOpen} onOpenChange={setPlanModalOpen} />
    </div>
  )
}
