'use client'

import { Lock, NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserSnackbar } from '@/lib/hooks'
import { useDeleteActivityEntry, useHireActivityLog } from '@/lib/hooks/useActivityLog'
import { formatDuration } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import type { ActivityEntry, HireActivityLog } from '@/types/activity-log'

import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_LABELS } from './activity-types'
import { ActivityEntryDialog } from './ActivityEntryDialog'

/** "Tue, Nov 3" for a "YYYY-MM-DD". */
function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** "November 2026" for a "YYYY-MM-DD". */
function monthLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

interface EntryGroup {
  key: string
  label: string
  entries: ActivityEntry[]
}

/**
 * Entries grouped by the billed month they fall in (in-app monthly hires, so
 * groups match the months on the Billing tab), else by calendar month.
 */
function groupEntries(log: HireActivityLog): EntryGroup[] {
  const periodLabels = new Map(log.periods.map((p) => [p.id, p.label]))
  const groups: EntryGroup[] = []
  for (const entry of log.entries) {
    const key = entry.periodId ?? entry.activityDate.slice(0, 7)
    let group = groups.find((g) => g.key === key)
    if (!group) {
      group = {
        key,
        label:
          (entry.periodId && periodLabels.get(entry.periodId)) || monthLabel(entry.activityDate),
        entries: [],
      }
      groups.push(group)
    }
    group.entries.push(entry)
  }
  return groups
}

/** "4 activities · 2 h 30 min · 25 charts reviewed" */
function groupSummary(entries: ActivityEntry[]): string {
  const minutes = entries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0)
  const charts = entries.reduce((sum, e) => sum + (e.chartCount ?? 0), 0)
  return [
    `${entries.length} ${entries.length === 1 ? 'activity' : 'activities'}`,
    minutes > 0 ? formatDuration(minutes) : null,
    charts > 0 ? `${charts} chart${charts === 1 ? '' : 's'} reviewed` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

function EntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: ActivityEntry
  onEdit?: () => void
  onDelete?: () => void
}) {
  const Icon = ACTIVITY_TYPE_ICONS[entry.type]
  const details = [
    entry.durationMinutes ? formatDuration(entry.durationMinutes) : null,
    entry.chartCount ? `${entry.chartCount} chart${entry.chartCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean)
  // Backdated entries say when they were written.
  const loggedLater = entry.loggedOn !== entry.activityDate

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-4 text-primary" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-sm font-medium text-foreground">{ACTIVITY_TYPE_LABELS[entry.type]}</p>
          <p className="text-sm text-muted-foreground">{shortDate(entry.activityDate)}</p>
          {details.length > 0 && (
            <p className="text-sm tabular-nums text-muted-foreground">· {details.join(' · ')}</p>
          )}
        </div>
        {entry.notes && (
          <p className="mt-1 whitespace-pre-line break-words text-sm text-foreground/90">
            {entry.notes}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {loggedLater && <span>Logged {shortDate(entry.loggedOn)}</span>}
          {entry.edited && <span>{loggedLater && '· '}Edited</span>}
          {entry.addedAfterDispute && (
            <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-medium text-amber-800">
              Added after the problem was reported
            </span>
          )}
          {entry.lockedReason && (
            <span className="inline-flex items-center gap-1" title={entry.lockedReason}>
              <Lock className="size-3" aria-hidden />
              <span className="sr-only">{entry.lockedReason}</span>
              <span aria-hidden>Locked</span>
            </span>
          )}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon-sm" aria-label="Edit activity" onClick={onEdit}>
              <Pencil className="size-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon-sm" aria-label="Delete activity" onClick={onDelete}>
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      )}
    </li>
  )
}

/**
 * A Medical Director hire's activity log for either side: the Medical
 * Director logs and edits entries; the client reads them. Grouped by month,
 * newest first. Never affects billing.
 */
export function ActivityLogPanel({
  hireId,
  counterpartName,
  enabled = true,
}: {
  hireId: string
  /** The other side: the client for a Medical Director, the Medical Director for a client. */
  counterpartName: string
  /** False while hidden (a closed dialog), so the log isn't fetched. */
  enabled?: boolean
}) {
  const { data: log, isLoading, isError, refetch } = useHireActivityLog(hireId, enabled)
  const [form, setForm] = useState<{ open: boolean; entry?: ActivityEntry }>({ open: false })
  const [deleting, setDeleting] = useState<ActivityEntry | null>(null)
  const deleteMutation = useDeleteActivityEntry(hireId)
  const { showSuccess, showError } = useUserSnackbar()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }
  if (isError || !log) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
        <p className="text-sm text-muted-foreground">We couldn&apos;t load the activity log.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const isMedicalDirector = log.role === 'supervisor'
  const groups = groupEntries(log)
  const intro = isMedicalDirector
    ? `Log meetings, chart reviews and protocol sign-offs for ${counterpartName}. They can see this log; it doesn't affect billing.`
    : `${counterpartName}'s record of their work for you: meetings, chart reviews and protocol sign-offs. It doesn't affect billing.${log.periods.length > 0 ? ' If something here doesn’t match what happened, use Report a problem on that month in Billing.' : ''}`

  const emptyText = !log.signed
    ? 'The activity log starts once the agreement is signed.'
    : isMedicalDirector
      ? 'No activity logged yet.'
      : `${counterpartName} hasn't logged any activity yet.`

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">{intro}</p>
        {log.canLog && (
          <Button size="sm" className="shrink-0" onClick={() => setForm({ open: true })}>
            <Plus className="size-3.5" aria-hidden />
            Log Activity
          </Button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed px-4 py-8 text-center">
          <NotebookPen className="size-6 text-muted-foreground" aria-hidden />
          <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
              <p className="text-xs tabular-nums text-muted-foreground">
                {groupSummary(group.entries)}
              </p>
            </div>
            <ul className="divide-y rounded-lg border">
              {group.entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onEdit={entry.canEdit ? () => setForm({ open: true, entry }) : undefined}
                  onDelete={entry.canEdit ? () => setDeleting(entry) : undefined}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      {isMedicalDirector && (
        <ActivityEntryDialog
          hireId={hireId}
          log={log}
          entry={form.entry}
          clientName={counterpartName}
          open={form.open}
          onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        />
      )}

      <ConfirmDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this activity?"
        description={
          deleting
            ? `${ACTIVITY_TYPE_LABELS[deleting.type]} on ${shortDate(deleting.activityDate)} will be removed from ${counterpartName}'s log too.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deleting &&
          deleteMutation.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null)
              showSuccess('Activity deleted')
            },
            onError: (err) => {
              setDeleting(null)
              showError(parseApiError(err))
            },
          })
        }
      />
    </div>
  )
}
