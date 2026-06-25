'use client'

import { AlertCircle, CalendarDays, Link2, MapPin, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ExpandableText } from '@/components/ui/expandable-text'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useUserSnackbar } from '@/lib/hooks'
import { useCancelConnection, useSentConnections } from '@/lib/hooks/useConnections'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatDate, formatDisplayName, formatLocation } from '@/lib/utils/profile-formatters'
import type { ConnectionRequest, ConnectionStatus } from '@/types/connections'

import { ConnectionStatusBadge } from './ConnectionStatusBadge'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Declined', value: 'DECLINED' },
  { label: 'Cancelled', value: 'CANCELED' },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SentConnectionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
            <div className="flex min-w-0 flex-1 gap-3">
              <Skeleton className="mt-0.5 size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-full max-w-[14rem]" />
                <Skeleton className="mt-2 h-5 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="size-8 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
            {Array.from({ length: 2 }).map((__, j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-4 w-full max-w-[9rem]" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Empty / Error states ──────────────────────────────────────────────────────

function SentConnectionsEmpty() {
  return (
    <Card className="border-dashed shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Link2 className="size-7 text-primary" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">No connection requests sent yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Find a supervisee and click <strong>Make a Connection</strong> to send your first request.
        </p>
      </div>
    </Card>
  )
}

function SentConnectionsError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">Failed to load sent requests</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Something went wrong. Please refresh the page to try again.
        </p>
      </div>
    </Card>
  )
}

// ─── Detail cell ──────────────────────────────────────────────────────────────

function DetailCell({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof MapPin
}) {
  const display = value.trim() && value !== 'N/A' ? value : 'Not specified'
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

// ─── Row actions ──────────────────────────────────────────────────────────────

function RowActions({ request }: { request: ConnectionRequest }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const cancelMutation = useCancelConnection()

  const canCancel = request.status === 'PENDING'

  function handleCancelConfirm() {
    cancelMutation.mutate(request.id, {
      onSuccess: () => {
        showSuccess('Connection request cancelled.')
        setConfirmOpen(false)
      },
      onError: (err) => {
        showError(parseApiError(err))
        setConfirmOpen(false)
      },
    })
  }

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={cancelMutation.isPending}
              aria-label="Row actions"
            >
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuPopup>
              {canCancel && (
                <>
                  <DropdownMenuItem destructive onClick={() => setConfirmOpen(true)}>
                    Cancel Request
                  </DropdownMenuItem>
                </>
              )}
              {!canCancel && <DropdownMenuItem disabled>No actions available</DropdownMenuItem>}
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel connection request?"
        description={`Cancel your connection request to ${formatDisplayName(request.receiver ?? { fullName: request.requesterName })}? You may be able to send a new one later.`}
        confirmLabel="Cancel Request"
        destructive
        isPending={cancelMutation.isPending}
        onConfirm={handleCancelConfirm}
      />
    </>
  )
}

// ─── Request card ─────────────────────────────────────────────────────────────

function SentRequestCard({ request }: { request: ConnectionRequest }) {
  const receiverName = request.receiver ? formatDisplayName(request.receiver) : 'Unknown'

  const receiverPhoto = request.receiver?.profilePhotoUrl ?? null

  const occupation = request.receiver?.superviseeProfile?.occupation
  const specialty = request.receiver?.superviseeProfile?.specialty
  const subline = [occupation, specialty].filter(Boolean).join(' · ') || null

  const location = request.receiver
    ? formatLocation(request.receiver.city, request.receiver.state)
    : 'N/A'

  const sentDate = formatDate(request.createdAt)

  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <UserAvatar
            src={receiverPhoto}
            name={receiverName}
            alt={`Profile photo of ${receiverName}`}
            size="lg"
            className="mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
              {request.receiver?.id ? (
                <Link
                  href={`/find-supervisees/${request.receiver.id}?from=sent-connections`}
                  className="hover:underline"
                >
                  {receiverName}
                </Link>
              ) : (
                receiverName
              )}
            </h3>
            {subline && (
              <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
                {subline}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ConnectionStatusBadge status={request.status as ConnectionStatus} />
            </div>
          </div>
        </div>
        <div className="shrink-0 self-start">
          <RowActions request={request} />
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="border-t border-border/50 px-5 py-3">
          <ExpandableText maxLines={3}>{request.message}</ExpandableText>
        </div>
      )}

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
        <DetailCell label="Location" value={location} icon={MapPin} />
        <DetailCell label="Sent" value={sentDate} icon={CalendarDays} />
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SentConnectionsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading, isError } = useSentConnections(page, PAGE_SIZE, statusFilter)

  const items = data?.items ?? []
  const totalCount = data?.meta.totalCount ?? 0
  const totalPages = data?.meta.totalPages ?? 1

  function handleTabChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Connection requests you have sent to supervisees. Pending requests can be cancelled if you
        change your mind.
      </p>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SentConnectionsSkeleton />
      ) : isError ? (
        <SentConnectionsError />
      ) : items.length === 0 ? (
        <SentConnectionsEmpty />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((request) => (
              <SentRequestCard key={request.id} request={request} />
            ))}
          </div>

          {totalPages > 1 && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
