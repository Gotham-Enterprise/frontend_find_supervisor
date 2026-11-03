'use client'

import axios from 'axios'
import { Download } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exportActivityLog } from '@/lib/api/activity-log'
import { useUserSnackbar } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { toEasternISODate } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import type { HireActivityLog } from '@/types/activity-log'

const ALL = 'all'
const CUSTOM = 'custom'

/** "November 2026" for a "YYYY-MM". */
function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** First and last day of a "YYYY-MM". */
function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` }
}

/** The backend's error message, read out of a Blob error response. */
async function blobErrorMessage(err: unknown): Promise<string> {
  if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await err.response.data.text()) as { message?: string }
      if (body.message) return body.message
    } catch {
      // not JSON: fall through
    }
  }
  return parseApiError(err)
}

/**
 * Download the activity log as a PDF (for a board or audit) or CSV (for a
 * spreadsheet): all of it, one month, or chosen dates.
 */
export function ActivityExportDialog({
  hireId,
  log,
  fileLabel,
  open,
  onOpenChange,
}: {
  hireId: string
  log: HireActivityLog
  /** Goes into the file name (the other side's name). */
  fileLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { showError } = useUserSnackbar()
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf')
  const [range, setRange] = useState<string>(ALL)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState(false)
  // Months that have entries, newest first.
  const months = [...new Set(log.entries.map((e) => e.activityDate.slice(0, 7)))]
  const today = toEasternISODate()
  const customInvalid = range === CUSTOM && (!from || !to || from > to)

  async function download() {
    const dates: { from?: string; to?: string } =
      range === ALL ? {} : range === CUSTOM ? { from, to } : monthRange(range)
    setBusy(true)
    try {
      const blob = await exportActivityLog(hireId, { format, ...dates })
      const slug = fileLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const span = dates.from ? `${dates.from}_to_${dates.to}` : `through_${today}`
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `activity-log_${slug || 'export'}_${span}.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      onOpenChange(false)
    } catch (err) {
      showError(await blobErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogTitle>Export Activity Log</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          A PDF to keep for a board or audit, or a CSV for a spreadsheet. Each entry shows when it
          was logged.
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">Format</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Format">
              {(['pdf', 'csv'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={format === value}
                  disabled={busy}
                  onClick={() => setFormat(value)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                    format === value
                      ? 'border-primary bg-primary/5 font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50',
                  )}
                >
                  {value === 'pdf' ? 'PDF document' : 'CSV spreadsheet'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Dates</p>
            <Select value={range} onValueChange={(v) => setRange(v ?? ALL)} disabled={busy}>
              <SelectTrigger className="mt-1.5 w-full" aria-label="Dates">
                <SelectValue>
                  {range === ALL
                    ? 'All activity'
                    : range === CUSTOM
                      ? 'Choose dates'
                      : monthLabel(range)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All activity</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {monthLabel(month)}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM}>Choose dates</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {range === CUSTOM && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="activity-export-from">From</Label>
                <Input
                  id="activity-export-from"
                  type="date"
                  value={from}
                  max={to || today}
                  disabled={busy}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="activity-export-to">To</Label>
                <Input
                  id="activity-export-to"
                  type="date"
                  value={to}
                  min={from || undefined}
                  max={today}
                  disabled={busy}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={busy || customInvalid} onClick={() => void download()}>
            <Download className="size-4" aria-hidden />
            {busy ? 'Preparing…' : 'Download'}
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
