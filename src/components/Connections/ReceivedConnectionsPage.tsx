'use client'

import { AlertCircle, CalendarDays, Link2, MapPin, MessageCircle, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useUserSnackbar } from '@/lib/hooks'
import {
  useApproveConnection,
  useDeclineConnection,
  useReceivedConnections,
} from '@/lib/hooks/useConnections'
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
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ReceivedConnectionsSkeleton() {
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

function ReceivedConnectionsEmpty() {
  return (
    <Card className="border-dashed shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Link2 className="size-7 text-primary" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">No connection requests yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Connection requests from supervisors will appear here once they reach out to you.
        </p>
      </div>
    </Card>
  )
}

function ReceivedConnectionsError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">
          Failed to load connection requests
        </p>
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

type PendingAction = 'approve' | 'decline' | null

function RowActions({ request }: { request: ConnectionRequest }) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const { showSuccess, showError } = useUserSnackbar()
  const router = useRouter()
  const approveMutation = useApproveConnection()
  const declineMutation = useDeclineConnection()

  const isPending = request.status === 'PENDING'
  const isApproved = request.status === 'APPROVED'
  const isMutating = approveMutation.isPending || declineMutation.isPending

  function closeDialog() {
    setPendingAction(null)
  }

  function handleApproveConfirm() {
    approveMutation.mutate(request.id, {
      onSuccess: (result) => {
        closeDialog()
        if (result.conversationId) {
          showSuccess('Connection approved. Redirecting to messages...')
          router.push(`/messages/${result.conversationId}`)
        } else {
          showSuccess('Connection request approved.')
        }
      },
      onError: (err) => {
        showError(parseApiError(err))
        closeDialog()
      },
    })
  }

  function handleDeclineConfirm() {
    declineMutation.mutate(
      { connectionId: request.id },
      {
        onSuccess: () => {
          showSuccess('Connection request declined.')
          closeDialog()
        },
        onError: (err) => {
          showError(parseApiError(err))
          closeDialog()
        },
      },
    )
  }

  function handleMessageSupervisor() {
    if (request.conversationId) {
      router.push(`/messages/${request.conversationId}`)
    } else {
      router.push('/messages')
    }
  }

  if (isApproved) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 gap-1.5"
        onClick={handleMessageSupervisor}
      >
        <MessageCircle className="size-3.5" aria-hidden />
        Message Supervisor
      </Button>
    )
  }

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" disabled={isMutating} aria-label="Row actions">
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuPopup>
              {isPending && (
                <>
                  <DropdownMenuItem onClick={() => setPendingAction('approve')}>
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onClick={() => setPendingAction('decline')}>
                    Decline
                  </DropdownMenuItem>
                </>
              )}
              {!isPending && <DropdownMenuItem disabled>No actions available</DropdownMenuItem>}
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <ConfirmDialog
        open={pendingAction === 'approve'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Approve connection request?"
        description={`Approve the connection request from ${request.requesterName}? This will open a conversation thread between you and the supervisor.`}
        confirmLabel="Approve"
        isPending={approveMutation.isPending}
        onConfirm={handleApproveConfirm}
      />

      <ConfirmDialog
        open={pendingAction === 'decline'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Decline connection request?"
        description={`Decline the connection request from ${request.requesterName}? They may be able to send another request after a cooldown period.`}
        confirmLabel="Decline"
        destructive
        isPending={declineMutation.isPending}
        onConfirm={handleDeclineConfirm}
      />
    </>
  )
}

// ─── Request card ─────────────────────────────────────────────────────────────

function ReceivedRequestCard({ request }: { request: ConnectionRequest }) {
  const senderName = request.requester
    ? formatDisplayName(request.requester) !== 'Unknown'
      ? formatDisplayName(request.requester)
      : request.requesterName
    : request.requesterName

  const senderPhoto = request.requester?.profilePhotoUrl ?? null

  const supervisorType = request.requester?.supervisorProfile?.supervisorType
  const occupation = request.requester?.supervisorProfile?.occupation
  const specialty = request.requester?.supervisorProfile?.specialty
  const subline = [supervisorType ?? occupation, specialty].filter(Boolean).join(' · ') || null

  const location = request.requester
    ? formatLocation(request.requester.city, request.requester.state)
    : 'N/A'

  const sentDate = formatDate(request.createdAt)

  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <UserAvatar
            src={senderPhoto}
            name={senderName}
            alt={`Profile photo of ${senderName}`}
            size="lg"
            className="mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
              {request.requester?.id ? (
                <Link
                  href={`/find-supervisors/${request.requester.id}?from=received-connections`}
                  className="hover:underline"
                >
                  {senderName}
                </Link>
              ) : (
                senderName
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
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {request.message}
          </p>
        </div>
      )}

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
        <DetailCell label="Location" value={location} icon={MapPin} />
        <DetailCell label="Received" value={sentDate} icon={CalendarDays} />
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReceivedConnectionsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading, isError } = useReceivedConnections(page, PAGE_SIZE, statusFilter)

  const items = data?.items ?? []
  const totalCount = data?.meta.totalCount ?? 0
  const totalPages = data?.meta.totalPages ?? 1

  function handleTabChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Supervisors who would like to connect with you will appear here. Review their introduction
        and choose to approve or decline each request.
      </p>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
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
        <ReceivedConnectionsSkeleton />
      ) : isError ? (
        <ReceivedConnectionsError />
      ) : items.length === 0 ? (
        <ReceivedConnectionsEmpty />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((request) => (
              <ReceivedRequestCard key={request.id} request={request} />
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
