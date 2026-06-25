'use client'

import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Monitor,
  MoreVertical,
  Target,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { HireStatusBadge } from '@/components/HiredSupervisors/HireStatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useHiresList } from '@/lib/hooks'
import {
  formatAvailability,
  formatContactNumber,
  formatDate,
  formatDisplayName,
  formatLocation,
  formatSupervisionFormat,
  formatSupervisionHours,
} from '@/lib/utils/profile-formatters'
import type { HireListItem, HireStatus } from '@/types/hire'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

type TabStatus = 'ALL' | 'ACCEPTED' | 'COMPLETED'

const TABS: { id: TabStatus; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'COMPLETED', label: 'Completed' },
]

function isCompletedTabHire(hire: HireListItem): boolean {
  return hire.status === 'COMPLETED' || (hire.status === 'REVIEWED' && hire.completedAt != null)
}

// ─── Detail cell ──────────────────────────────────────────────────────────────

function DetailCell({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const display = value.trim() && value !== 'N/A' && value !== '—' ? value : 'Not specified'
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SuperviseesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
            <div className="flex min-w-0 gap-3">
              <Skeleton className="mt-0.5 size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-full max-w-[14rem]" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
            {Array.from({ length: 4 }).map((__, j) => (
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function SuperviseesEmpty({ tab }: { tab: TabStatus }) {
  const messages: Record<TabStatus, { title: string; body: string }> = {
    ALL: {
      title: 'No supervisees yet',
      body: 'Once supervisees request your supervision and you accept, they will appear here.',
    },
    ACCEPTED: {
      title: 'No accepted supervisees',
      body: 'Supervisees whose requests you have accepted will appear here.',
    },
    COMPLETED: {
      title: 'No completed supervisions',
      body: 'Supervisions that have been marked as completed will appear here.',
    },
  }
  const { title, body } = messages[tab]

  return (
    <Card className="border-dashed shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Users className="size-7 text-primary" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">{body}</p>
      </div>
    </Card>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function SuperviseesError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">Failed to load supervisees</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Something went wrong. Please refresh the page to try again.
        </p>
      </div>
    </Card>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-foreground">
        Showing {from}–{to} of {totalCount} result{totalCount !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-[4rem] text-center text-sm font-medium tabular-nums text-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Details dialog ───────────────────────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{value || '—'}</dd>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0 break-words whitespace-pre-wrap rounded-md bg-muted/50 px-3 py-2 text-sm text-foreground leading-relaxed">
        {value || '—'}
      </dd>
    </div>
  )
}

function SuperviseeDetailsDialog({
  hire,
  open,
  onOpenChange,
}: {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { supervisee } = hire
  const occupation = supervisee.occupation?.name
  const specialty = supervisee.specialty?.name
  const location = formatLocation(supervisee.city, supervisee.state, supervisee.zipcode)
  const licensureStates = supervisee.stateOfLicensure?.length
    ? supervisee.stateOfLicensure.join(', ')
    : null

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogTitle>Supervisee Details</DialogTitle>

        <section className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Profile</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <DetailItem label="Name" value={formatDisplayName(supervisee)} />
            <DetailItem label="Email" value={supervisee.email} />
            <DetailItem
              label="Contact Number"
              value={formatContactNumber(supervisee.contactNumber)}
            />
            <DetailItem label="Occupation" value={occupation} />
            <DetailItem label="Specialty" value={specialty} />
            <DetailItem label="Location" value={location} />
            <DetailItem label="State(s) of Licensure" value={licensureStates} />
          </dl>
        </section>

        <div className="my-5 border-t" />

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Supervision Details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <DetailItem label="Format" value={formatSupervisionFormat(hire.preferredFormat)} />
            <DetailItem
              label="Availability"
              value={formatAvailability(hire.preferredAvailability)}
            />
            <DetailItem
              label="Start Date"
              value={formatDate(hire.startDate ?? hire.preferredStartDate)}
            />
            {hire.supervisionHours != null && (
              <DetailItem
                label="Supervision Hours Needed"
                value={formatSupervisionHours(hire.supervisionHours)}
              />
            )}
            <DetailItem
              label="Status"
              value={<HireStatusBadge status={hire.status} completedAt={hire.completedAt} />}
            />
          </dl>
        </section>

        <div className="my-5 border-t" />

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Message & Goals</h3>
          <dl className="space-y-4">
            <DetailBlock label="Intro Message" value={hire.introMessage} />
            <DetailBlock label="Goals" value={hire.goals} />
          </dl>
        </section>
      </DialogContent>
    </DialogRoot>
  )
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function RowActions({ hire }: { hire: HireListItem }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuPopup>
              <DropdownMenuItem onClick={() => setDetailsOpen(true)}>View Details</DropdownMenuItem>
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <SuperviseeDetailsDialog hire={hire} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  )
}

// ─── Supervisee card ──────────────────────────────────────────────────────────

function SuperviseeCard({ hire }: { hire: HireListItem }) {
  const superviseeName = formatDisplayName(hire.supervisee)
  const occupation = hire.supervisee.occupation?.name?.trim()
  const specialty = hire.supervisee.specialty?.name?.trim()
  const occupationDisplay =
    occupation && specialty
      ? `${occupation} · ${specialty}`
      : (occupation ?? specialty ?? 'Not specified')

  const locationRaw = formatLocation(hire.supervisee.city, hire.supervisee.state)
  const formatRaw = formatSupervisionFormat(hire.preferredFormat)
  const startDateRaw = formatDate(hire.startDate ?? hire.preferredStartDate)
  const goalsRaw = hire.goals?.trim() || 'Not specified'

  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <UserAvatar
            src={hire.supervisee.profilePhotoUrl}
            name={superviseeName}
            alt={`Profile photo of ${superviseeName}`}
            size="lg"
            className="mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
              {superviseeName}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {occupationDisplay}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <HireStatusBadge status={hire.status} completedAt={hire.completedAt} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 self-start">
          <RowActions hire={hire} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
        <DetailCell label="Format" value={formatRaw} icon={Monitor} />
        <DetailCell label="Start Date" value={startDateRaw} icon={CalendarDays} />
        <DetailCell label="Location" value={locationRaw} icon={MapPin} />
        <DetailCell label="Goals" value={goalsRaw} icon={Target} />
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SuperviseesPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>('ACCEPTED')
  const [page, setPage] = useState(1)

  const isCompletedTab = activeTab === 'COMPLETED'
  /** Completed tab loads all hires and filters/paginates on the client; other tabs use API filters. */
  const apiPage = isCompletedTab ? 1 : page
  const apiLimit = isCompletedTab ? 0 : PAGE_SIZE
  const apiStatus = activeTab === 'ACCEPTED' ? ('ACCEPTED' satisfies HireStatus) : undefined

  const { data, isLoading, isError } = useHiresList(apiPage, apiLimit, apiStatus)

  const rawItems = useMemo(() => data?.items ?? [], [data?.items])

  const completedMatches = useMemo(() => rawItems.filter(isCompletedTabHire), [rawItems])

  const items = useMemo(() => {
    if (!isCompletedTab) {
      return rawItems
    }
    const start = (page - 1) * PAGE_SIZE
    return completedMatches.slice(start, start + PAGE_SIZE)
  }, [isCompletedTab, rawItems, completedMatches, page])

  const totalCount = isCompletedTab ? completedMatches.length : (data?.totalCount ?? 0)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function handleTabChange(tab: TabStatus) {
    setActiveTab(tab)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">My Supervisees</h2>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Everyone who has requested your supervision is listed here. Use the tabs to filter by
          status, and open the menu on any card to view full profile and supervision details.
        </p>
      </div>

      {/* Status filter tabs */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter supervisees by status"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <SuperviseesSkeleton />
      ) : isError ? (
        <SuperviseesError />
      ) : items.length === 0 ? (
        <SuperviseesEmpty tab={activeTab} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((hire) => (
              <SuperviseeCard key={hire.id} hire={hire} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
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
