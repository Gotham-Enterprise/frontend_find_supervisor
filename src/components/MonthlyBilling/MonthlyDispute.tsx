'use client'

import { FilePlus2, FileText, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUserSnackbar } from '@/lib/hooks'
import {
  useAddMonthlyDisputeEvidence,
  useDisputeMonthlyPeriod,
} from '@/lib/hooks/useMonthlyBilling'
import { useObjectUrls } from '@/lib/hooks/useObjectUrls'
import { formatEasternDateTime } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import type {
  DisputeEvidenceFile,
  DisputeEvidenceItem,
  HireMonthlyBilling,
  MonthlyDisputeCategory,
  MonthlyPeriod,
} from '@/types/monthly-billing'

/**
 * Disputes on a billed month (Medical Director billing): the client's report
 * with a category and files, the evidence timeline both sides add to while
 * Gotham support reviews it, and the form for adding to it. Mirrors the
 * backend's limits: 5 files at a time, 15 per side per month, 10 MB each.
 */

type Role = HireMonthlyBilling['role']

export const DISPUTE_CATEGORY_LABELS: Record<MonthlyDisputeCategory, string> = {
  UNREACHABLE: "Couldn't reach the Medical Director",
  MISSED_MEETINGS: 'Missed meetings or calls',
  NO_CHART_REVIEW: "Charts weren't reviewed",
  PROTOCOLS_NOT_SIGNED: "Protocols or standing orders weren't signed",
  UNPROFESSIONAL: 'Unprofessional conduct',
  OTHER: 'Other',
}

const REASON_MIN = 10
const NOTE_MAX = 1000
const FILES_PER_SUBMISSION = 5
const FILE_MAX_MB = 10
const FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const isImage = (type: string) => type.startsWith('image/')

/** Files chosen for a submission: images preview as thumbnails, PDFs as chips. */
function EvidenceFilesField({
  files,
  onChange,
  disabled,
  filesLeft,
}: {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
  /** How many more this side can attach to the month. */
  filesLeft: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const max = Math.min(FILES_PER_SUBMISSION, filesLeft)
  const previews = useObjectUrls(files, isImage)

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    let problem: string | null = null
    for (const file of Array.from(list)) {
      if (next.length >= max) {
        problem =
          max < FILES_PER_SUBMISSION
            ? `You can attach ${filesLeft} more file${filesLeft === 1 ? '' : 's'} to this month.`
            : `You can attach up to ${FILES_PER_SUBMISSION} files at a time.`
        break
      }
      if (!FILE_TYPES.includes(file.type)) {
        problem = `${file.name} isn't a JPG, PNG or PDF.`
        continue
      }
      if (file.size > FILE_MAX_MB * 1024 * 1024) {
        problem = `${file.name} is over ${FILE_MAX_MB} MB.`
        continue
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue
      next.push(file)
    }
    setError(problem)
    onChange(next)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (max <= 0 && files.length === 0) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        You&apos;ve attached the most files allowed for this month.
      </p>
    )
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-foreground">
          Files <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <span className="text-xs text-muted-foreground">
          {files.length} / {max} · JPG, PNG or PDF, up to {FILE_MAX_MB} MB each
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={FILE_TYPES.join(',')}
        multiple
        hidden
        disabled={disabled || files.length >= max}
        onChange={(e) => addFiles(e.target.files)}
        aria-label="Attach files"
      />
      <div className="mt-1.5 flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div key={`${file.name}-${file.size}`} className="relative">
            {previews[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previews[i]!}
                alt={file.name}
                className="size-20 rounded-md border object-cover"
              />
            ) : (
              <div className="flex size-20 flex-col items-center justify-center gap-1 rounded-md border bg-muted/40 px-1">
                <FileText className="size-5 text-muted-foreground" aria-hidden />
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                  {file.name}
                </span>
              </div>
            )}
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              disabled={disabled}
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute -right-1.5 -top-1.5 rounded-full border bg-background p-0.5 text-muted-foreground shadow-sm hover:text-foreground"
            >
              <X className="size-3" />
            </button>
            <span className="mt-0.5 block w-20 truncate text-[10px] text-muted-foreground">
              {formatSize(file.size)}
            </span>
          </div>
        ))}
        {files.length < max && (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="size-20 flex-col gap-1 rounded-md border-dashed px-0 text-xs"
          >
            <FilePlus2 className="size-4" aria-hidden />
            Add file
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

function EvidenceFileLink({ file }: { file: DisputeEvidenceFile }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      title={file.fileName}
      className="block rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isImage(file.contentType) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.url} alt={file.fileName} className="size-16 rounded-md object-cover" />
      ) : (
        <span className="flex h-16 w-28 flex-col items-center justify-center gap-1 px-1.5">
          <FileText className="size-4 text-muted-foreground" aria-hidden />
          <span className="w-full truncate text-center text-[10px] text-foreground">
            {file.fileName}
          </span>
        </span>
      )}
    </a>
  )
}

/** Who wrote a submission, from the viewer's side. */
function authorLabel(item: DisputeEvidenceItem, index: number, role: Role, counterpart: string) {
  const mine = (item.authorRole === 'SUPERVISOR') === (role === 'supervisor')
  if (index === 0 && item.authorRole === 'SUPERVISEE') {
    return mine ? 'Your report' : `${counterpart}'s report`
  }
  if (item.authorRole === 'SUPERVISOR') return mine ? 'Your side' : `${counterpart}'s side`
  return mine ? 'You added' : `${counterpart} added`
}

/** The month's dispute, oldest first: the report, then what either side added. */
export function DisputeTimeline({
  period,
  role,
  counterpartName,
}: {
  period: MonthlyPeriod
  role: Role
  counterpartName: string
}) {
  return (
    <ol className="mt-2 space-y-2 rounded-md bg-muted/50 px-3 py-2.5">
      {period.disputeCategory && (
        <li className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Problem:</span>{' '}
          {DISPUTE_CATEGORY_LABELS[period.disputeCategory]}
        </li>
      )}
      {period.evidence.map((item, i) => (
        <li key={item.id} className="text-xs">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {authorLabel(item, i, role, counterpartName)}
            </span>{' '}
            · {formatEasternDateTime(item.createdAt)}
          </p>
          {item.note && (
            <p className="mt-0.5 whitespace-pre-line break-words text-foreground/90">{item.note}</p>
          )}
          {item.files.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-2">
              {item.files.map((file) => (
                <EvidenceFileLink key={file.id} file={file} />
              ))}
            </div>
          )}
        </li>
      ))}
      {period.resolutionNote && (
        <li className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Support&apos;s decision:</span>{' '}
          {period.resolutionNote}
        </li>
      )}
    </ol>
  )
}

/** The client reports a problem with a paid month: what kind, what happened, and files. */
export function ReportProblemForm({
  hireId,
  period,
  counterpartName,
  onClose,
}: {
  hireId: string
  period: MonthlyPeriod
  counterpartName: string
  onClose: () => void
}) {
  const { showSuccess, showError } = useUserSnackbar()
  const dispute = useDisputeMonthlyPeriod(hireId)
  const [category, setCategory] = useState<MonthlyDisputeCategory | null>(null)
  const [reason, setReason] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const busy = dispute.isPending

  function submit() {
    if (!category) return
    dispute.mutate(
      { periodId: period.id, reason: reason.trim(), category, files },
      {
        onSuccess: () => {
          onClose()
          showSuccess('Problem reported', {
            description: `The payment is on hold. Gotham support will review it, and ${counterpartName} can add their side.`,
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  return (
    <div className="mt-3 space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">What went wrong this month?</p>
        <Select
          value={category}
          onValueChange={(v) => setCategory((v as MonthlyDisputeCategory | null) ?? null)}
          disabled={busy}
        >
          <SelectTrigger className="mt-1.5 w-full" aria-label="Problem">
            <SelectValue placeholder="Choose the problem">
              {category ? DISPUTE_CATEGORY_LABELS[category] : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DISPUTE_CATEGORY_LABELS) as MonthlyDisputeCategory[]).map((value) => (
              <SelectItem key={value} value={value}>
                {DISPUTE_CATEGORY_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        id={`dispute-${period.id}`}
        aria-label="What happened"
        rows={3}
        maxLength={NOTE_MAX}
        value={reason}
        disabled={busy}
        onChange={(e) => setReason(e.target.value)}
        placeholder={`What happened, with dates. E.g. ${counterpartName} didn't answer calls or messages from Oct 10 to 24.`}
      />
      <EvidenceFilesField
        files={files}
        onChange={setFiles}
        disabled={busy}
        filesLeft={period.evidenceFilesLeft}
      />
      <p className="text-xs text-muted-foreground">
        Screenshots of calls, texts or emails, or documents that show what happened. Don&apos;t
        include patient information. The payment is held and Gotham support reviews it with you
        both, which may include reading your messages with {counterpartName} from this month;{' '}
        {counterpartName} sees your report and can add their side. Support decides how much is
        released to them, and the rest goes back to your card.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={busy || !category || reason.trim().length < REASON_MIN}
          onClick={submit}
        >
          {busy ? 'Reporting…' : 'Report Problem'}
        </Button>
      </div>
    </div>
  )
}

/** Either side adds a note and/or files while support reviews the month. */
export function AddEvidenceForm({
  hireId,
  period,
  role,
  counterpartName,
  onClose,
}: {
  hireId: string
  period: MonthlyPeriod
  role: Role
  counterpartName: string
  onClose: () => void
}) {
  const { showSuccess, showError } = useUserSnackbar()
  const add = useAddMonthlyDisputeEvidence(hireId)
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const busy = add.isPending
  const isMd = role === 'supervisor'

  function submit() {
    add.mutate(
      { periodId: period.id, note: note.trim(), files },
      {
        onSuccess: () => {
          onClose()
          showSuccess(isMd ? 'Your side was added' : 'Added to your report', {
            description: `Gotham support and ${counterpartName} can see it.`,
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  return (
    <div className="mt-3 space-y-2">
      <label htmlFor={`evidence-${period.id}`} className="text-sm font-medium text-foreground">
        {isMd ? 'Your side of what happened' : 'What else should support know?'}
      </label>
      <Textarea
        id={`evidence-${period.id}`}
        rows={3}
        maxLength={NOTE_MAX}
        value={note}
        disabled={busy}
        onChange={(e) => setNote(e.target.value)}
        placeholder={
          isMd
            ? 'E.g. Reviewed 12 charts on Oct 20 and called on Oct 22; see the attached log.'
            : 'E.g. Another missed call on Oct 28.'
        }
      />
      <EvidenceFilesField
        files={files}
        onChange={setFiles}
        disabled={busy}
        filesLeft={period.evidenceFilesLeft}
      />
      <p className="text-xs text-muted-foreground">
        Gotham support and {counterpartName} see what you add. Support may also read your messages
        with {counterpartName} from this month. Don&apos;t include patient information.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={busy || (note.trim().length === 0 && files.length === 0)}
          onClick={submit}
        >
          {busy ? 'Adding…' : isMd ? 'Add Your Side' : 'Add to Report'}
        </Button>
      </div>
    </div>
  )
}
