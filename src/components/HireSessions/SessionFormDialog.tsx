'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { FormSelectField } from '@/components/ui/form-select-field'
import { Textarea } from '@/components/ui/textarea'
import { useLogHireSession, useUpdateHireSession, useUserSnackbar } from '@/lib/hooks'
import { formatDuration } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import type { BillingWeek, HireBillingWeeks, HireSession } from '@/types/sessions'

const NOTES_MAX = 1000
const UNIT_MINUTES = 15
/** Longest single session; a longer day is logged as two entries. Mirrored by the backend validator. */
const MAX_SESSION_MINUTES = 8 * 60
/** Preselected duration: the typical supervision session. */
const DEFAULT_SESSION_MINUTES = 60

const sessionSchema = z.object({
  sessionDate: z.string().min(1, 'Session date is required'),
  durationMinutes: z.string().min(1, 'Choose how long the session was'),
  notes: z
    .string()
    .trim()
    .min(1, 'Add a short note about the session')
    .max(NOTES_MAX, `Keep notes under ${NOTES_MAX} characters`),
})

type SessionFormValues = z.infer<typeof sessionSchema>

/** The billing week (Sat–Fri) a date falls in, if it has a row yet. */
function weekForDate(weeks: BillingWeek[], date: string): BillingWeek | undefined {
  return weeks.find((w) => w.startDate <= date && date <= w.endDate)
}

/** All 15-minute durations up to the per-session maximum. */
const DURATION_OPTIONS = Array.from({ length: MAX_SESSION_MINUTES / UNIT_MINUTES }, (_, i) => {
  const minutes = (i + 1) * UNIT_MINUTES
  return { value: String(minutes), label: formatDuration(minutes) }
})

/**
 * Supervisor logs (or edits) one supervision session: date, duration in
 * 15-minute units, and notes. The weekly max and the agreement's total hours
 * are soft: a session that takes the week (or the agreement) over them is still
 * logged — it's flagged to the supervisee on the invoice, who can report a
 * problem — so the form warns but never blocks. The backend enforces the
 * logging window.
 */
export function SessionFormDialog({
  hireId,
  data,
  session,
  open,
  onOpenChange,
}: {
  hireId: string
  data: HireBillingWeeks
  /** Set when editing an existing session. */
  session?: HireSession
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { showSuccess, showError } = useUserSnackbar()
  const logMutation = useLogHireSession(hireId)
  const updateMutation = useUpdateHireSession(hireId)
  const isEdit = session != null
  const isPending = logMutation.isPending || updateMutation.isPending
  const cap = data.terms.weeklyCapMinutes
  const loggable = data.loggable

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { sessionDate: '', durationMinutes: String(DEFAULT_SESSION_MINUTES), notes: '' },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      sessionDate: session?.sessionDate ?? loggable?.to ?? '',
      durationMinutes: session ? String(session.durationMinutes) : String(DEFAULT_SESSION_MINUTES),
      notes: session?.notes ?? '',
    })
  }, [open, session, loggable?.to, form])

  const sessionDate = useWatch({ control: form.control, name: 'sessionDate' })
  const durationValue = useWatch({ control: form.control, name: 'durationMinutes' })
  const notes = useWatch({ control: form.control, name: 'notes' })
  const chosenMinutes = Number(durationValue) || 0

  // Where the chosen date's week would land with this session (its own time
  // counts as free when editing it), against the soft weekly max.
  const week = sessionDate ? weekForDate(data.weeks, sessionDate) : undefined
  const ownWeekMinutes =
    session && week?.sessions.some((s) => s.id === session.id) ? session.durationMinutes : 0
  const weekAfter = (week?.loggedMinutes ?? 0) - ownWeekMinutes + chosenMinutes
  const leftMinutes = Math.max(cap - ((week?.loggedMinutes ?? 0) - ownWeekMinutes), 0)
  const overCap = sessionDate && weekAfter > cap ? weekAfter - cap : 0

  // Same for the agreement's total hours (an edited session is already counted in the total).
  const totalMinutes = data.progress.totalMinutes
  const totalAfter = data.progress.loggedMinutes - (session?.durationMinutes ?? 0) + chosenMinutes
  const overTotal =
    totalMinutes != null && totalAfter > totalMinutes ? totalAfter - totalMinutes : 0

  async function onSubmit(values: SessionFormValues) {
    const input = {
      sessionDate: values.sessionDate,
      durationMinutes: Number(values.durationMinutes),
      notes: values.notes.trim(),
    }
    try {
      if (session) {
        await updateMutation.mutateAsync({ sessionId: session.id, input })
        showSuccess('Session updated')
      } else {
        await logMutation.mutateAsync(input)
        showSuccess('Session logged', {
          description: `${formatDuration(input.durationMinutes)} added to this week.`,
        })
      }
      onOpenChange(false)
    } catch (err) {
      showError(parseApiError(err))
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-md">
        <DialogTitle>{isEdit ? 'Edit Session' : 'Log a Session'}</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Log each session in 15-minute units (up to {formatDuration(MAX_SESSION_MINUTES)} per
          session). The agreed weekly max is {formatDuration(cap)}; hours over it are flagged on
          your supervisee&apos;s invoice. Each week&apos;s sessions can be logged until Friday 11:59
          PM ET.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInputField
                control={form.control}
                name="sessionDate"
                label="Date"
                required
                type="date"
                min={loggable?.from}
                max={loggable?.to}
                clearErrorsOnChange
                isSubmitting={isPending}
              />
              <FormSelectField
                control={form.control}
                name="durationMinutes"
                label="Duration"
                required
                options={DURATION_OPTIONS}
                placeholder="Select duration"
                isSubmitting={isPending}
              />
            </div>
            {sessionDate && overCap === 0 && overTotal === 0 && (
              <p className="-mt-2 text-xs text-muted-foreground">
                {leftMinutes > 0
                  ? `${formatDuration(leftMinutes)} left under this week's max.`
                  : "This week is at its weekly max; anything more is flagged on your supervisee's invoice."}
              </p>
            )}
            {overCap > 0 && (
              <p
                role="status"
                className="-mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" aria-hidden />
                <span>
                  This takes the week over the agreed max of {formatDuration(cap)} (by{' '}
                  {formatDuration(overCap)}). Your supervisee will see it on the invoice and can
                  report a problem.
                </span>
              </p>
            )}
            {overTotal > 0 && totalMinutes != null && (
              <p
                role="status"
                className="-mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" aria-hidden />
                <span>
                  This takes the agreement past its {formatDuration(totalMinutes)} total (by{' '}
                  {formatDuration(overTotal)}). Your supervisee will see it on the invoice and can
                  report a problem.
                </span>
              </p>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      maxLength={NOTES_MAX}
                      placeholder="Topics covered, e.g. case review and treatment planning. Don't include client-identifying information."
                      disabled={isPending}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        form.clearErrors('notes')
                      }}
                    />
                  </FormControl>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {notes.length} / {NOTES_MAX}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Session'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
