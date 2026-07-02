'use client'

import { LockIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { SubscriptionModal } from '@/components/Dashboard/subscription/SubscriptionModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DisabledWithTooltip } from '@/components/ui/tooltip'
import { isSupervisorRole } from '@/lib/auth/roles'
import { useConversations, useSupervisorProfile, useUser } from '@/lib/hooks'
import { useCheckConnectionAvailability } from '@/lib/hooks/useConnections'
import { getMakeConnectionAccess } from '@/lib/utils/make-connection-access'
import {
  formatDisplayName,
  getInitials,
  isConnectedHireStatus,
  maskNameToFirstInitial,
} from '@/lib/utils/profile-formatters'
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

  // An existing request takes precedence over subscription gating so a supervisor
  // whose subscription lapsed still sees the true state of a connection they made.
  if (!checkIsLoading && !checkError && canRequest === false) {
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

  // Otherwise the button stays clickable: with access it opens the connection form;
  // without (no subscription, logged out) the hero's handleClick shows the right prompt.
  // A silently failed check also falls through here — 409s are handled on submit.
  return { label: 'Make A Connection', disabled: false, tooltip: '' }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SuperviseeProfileHero({ profile }: SuperviseeProfileHeroProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user: authUser } = useUser()
  const [connectionModalOpen, setConnectionModalOpen] = useState(false)
  const [autoOpenDismissed, setAutoOpenDismissed] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const { data: conversations } = useConversations()
  const { data: supervisorProfile, isLoading: supervisorProfileLoading } = useSupervisorProfile()

  const user = profile.user
  const fullName = formatDisplayName(user)
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

  // Run the availability check for any signed-in supervisor (the endpoint needs no
  // auth) so existing request/connection states stay visible even when the
  // subscription has lapsed or was never purchased.
  const checkEnabled = isSupervisorRole(authUser?.role) && !!authUser?.email
  const {
    data: checkData,
    isLoading: checkLoading,
    isError: checkError,
  } = useCheckConnectionAvailability(
    checkEnabled ? user.id : null,
    checkEnabled ? (authUser?.email ?? null) : null,
  )

  const isConnectionApproved = isAcceptedConnectionStatus(checkData?.reason)

  // Reveal the supervisee's full name only once connected (accepted connection or an
  // accepted-onward hire); otherwise mask to first name + last initial ("Katie C").
  const isConnected = isConnectionApproved || isConnectedHireStatus(profile.hiredInfo?.status)
  const displayName = isConnected ? fullName : maskNameToFirstInitial(fullName)

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

  // Upfront hint that connecting is a paid feature — clicking still opens the
  // upgrade prompt rather than being dead.
  const needsSubscription =
    !connectionButtonDisabled &&
    connectionAccess.allowed === false &&
    connectionAccess.reason === 'no_subscription'

  // After returning from checkout (?connect=1) reopen the connection form so the
  // supervisor can finish the request they started before paying. Derived from the
  // URL param rather than synced into state, per react-hooks/set-state-in-effect;
  // it activates once access and the availability check settle post-payment.
  const returnedFromCheckout = searchParams.get('connect') === '1'
  const autoOpenConnection =
    returnedFromCheckout &&
    !autoOpenDismissed &&
    connectionAccess.allowed &&
    !checkLoading &&
    checkData?.canRequest !== false

  function handleConnectionModalOpenChange(open: boolean) {
    setConnectionModalOpen(open)
    if (!open && returnedFromCheckout) {
      setAutoOpenDismissed(true)
      router.replace(pathname, { scroll: false })
    }
  }

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
            // The subscription hint shows on hover while the button stays clickable —
            // the wrapper only intercepts hover, not clicks.
            tooltip={
              needsSubscription
                ? 'Requires an active subscription. Click to view plans.'
                : connectionButtonTooltip
            }
            disabled={connectionButtonDisabled || needsSubscription}
          >
            <Button
              size="sm"
              variant="outline"
              disabled={connectionButtonDisabled}
              onClick={handleMakeConnectionClick}
            >
              {needsSubscription && <LockIcon aria-hidden />}
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
        open={connectionModalOpen || autoOpenConnection}
        onOpenChange={handleConnectionModalOpenChange}
        superviseeId={user.id}
        superviseeName={displayName}
        canAccess={connectionAccess.allowed}
      />

      <SubscriptionModal
        open={planModalOpen}
        onOpenChange={setPlanModalOpen}
        checkoutRedirect={`${pathname}?connect=1`}
        notice={{
          title: 'Make A Connection requires an active subscription.',
          description: 'Upgrade your plan to introduce yourself to supervisees.',
        }}
      />
    </div>
  )
}
