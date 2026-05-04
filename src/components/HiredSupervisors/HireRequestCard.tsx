'use client'

import {
  CalendarDays,
  DollarSign,
  type LucideIcon,
  MapPin,
  Monitor,
  MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useCancelHire, useUserSnackbar } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  formatDate,
  formatDisplayName,
  formatFeeAmount,
  formatLocation,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'
import type { HireListItem, HireStatus } from '@/types/hire'

import { HireStatusBadge } from './HireStatusBadge'

const CANCELABLE_STATUSES: ReadonlyArray<HireStatus> = ['PENDING', 'ACCEPTED', 'ACTIVE']

/** Normalizes API/formatter placeholders for empty values in supervisee-facing UI. */
function formatHireDetailDisplay(value: string): string {
  const v = value.trim()
  if (!v || v === 'N/A' || v === '—') return 'Not specified'
  return value
}

function DetailCell({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  const display = formatHireDetailDisplay(value)
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        <Icon className="size-3 shrink-0" aria-hidden />
        <span>{label}</span>
      </div>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{display}</p>
    </div>
  )
}

export function HireRequestCard({ hire }: { hire: HireListItem }) {
  const [reasonOpen, setReasonOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const cancelMutation = useCancelHire()

  const supervisorName = formatDisplayName(hire.supervisor)
  const occupation = hire.supervisor.occupation?.name?.trim()
  const specialty = hire.supervisor.specialty?.name?.trim()
  const occupationDisplay =
    occupation && specialty
      ? `${occupation} · ${specialty}`
      : (occupation ?? specialty ?? 'Not specified')

  const locationRaw = formatLocation(hire.supervisor.city, hire.supervisor.state)
  const formatRaw = formatSupervisionFormat(hire.supervisorFormat)
  const feeRaw = formatFeeAmount(hire.supervisorFeeAmount, hire.supervisorFeeType)
  const requestedRaw = formatDate(hire.createdAt)

  const hasRejectionReason = hire.status === 'REJECTED' && Boolean(hire.rejectionReason?.trim())
  const canCancel = CANCELABLE_STATUSES.includes(hire.status)
  const profileHref = `/find-supervisors/${hire.supervisorId}?from=hired-supervisors`

  function handleCancelConfirm() {
    cancelMutation.mutate(hire.id, {
      onSuccess: () => {
        showSuccess('Supervision request cancelled.')
        setCancelOpen(false)
      },
      onError: (err) => {
        showError(parseApiError(err))
        setCancelOpen(false)
      },
    })
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
          {/* Avatar + identity */}
          <Link
            href={profileHref}
            className="flex min-w-0 gap-3 rounded-lg outline-none ring-offset-background transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserAvatar
              src={hire.supervisor.profilePhotoUrl}
              name={supervisorName}
              alt={`Profile photo of ${supervisorName}`}
              size="lg"
              className="mt-0.5 shrink-0"
            />
            <div className="min-w-0 py-0.5">
              <h3 className="text-sm font-semibold leading-tight tracking-tight text-foreground">
                {supervisorName}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {occupationDisplay}
              </p>
            </div>
          </Link>

          {/* Status badge + actions menu */}
          <div className="flex shrink-0 items-center gap-1">
            <HireStatusBadge status={hire.status} />
            <DropdownMenuRoot>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label="Request actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuPortal>
                <DropdownMenuPositioner>
                  <DropdownMenuPopup>
                    <DropdownMenuItem>
                      <Link href={profileHref} className="w-full">
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    {hasRejectionReason && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onClick={() => setReasonOpen(true)}>
                          View Reason
                        </DropdownMenuItem>
                      </>
                    )}
                    {canCancel && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onClick={() => setCancelOpen(true)}>
                          Cancel Request
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuPopup>
                </DropdownMenuPositioner>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </div>
        </div>

        {/* ── Details ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
          <DetailCell label="Location" value={locationRaw} icon={MapPin} />
          <DetailCell label="Format" value={formatRaw} icon={Monitor} />
          <DetailCell label="Fee" value={feeRaw} icon={DollarSign} />
          <DetailCell label="Requested" value={requestedRaw} icon={CalendarDays} />
        </div>
      </Card>

      {hasRejectionReason && (
        <DialogRoot open={reasonOpen} onOpenChange={setReasonOpen}>
          <DialogContent className="max-w-sm">
            <DialogTitle>Rejection Reason</DialogTitle>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {hire.rejectionReason}
            </p>
          </DialogContent>
        </DialogRoot>
      )}

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => !open && setCancelOpen(false)}
        title="Cancel supervision request?"
        description={`You are about to cancel your supervision request with ${supervisorName}. This action cannot be undone.`}
        confirmLabel="Cancel Request"
        destructive
        isPending={cancelMutation.isPending}
        onConfirm={handleCancelConfirm}
      />
    </>
  )
}
