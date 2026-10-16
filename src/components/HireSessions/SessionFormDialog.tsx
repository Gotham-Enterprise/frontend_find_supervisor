'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
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

/** The billing week (Mon–Sun) a date falls in, if it has a row yet. */
function weekForDate(weeks: BillingWeek[], date: string): BillingWeek | undefined {
  return weeks.find((w) => w.startDate <= date && date <= w.endDate)
}

/**
 * Supervisor logs (or edits) one supervision session: date, duration in
 * 15-minute units up to the weekly max, and notes. The backend enforces the
 * weekly max, total hours and logging window too.
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
    defaultValues: { sessionDate: '', durationMinutes: '', notes: '' },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      sessionDate: session?.sessionDate ?? loggable?.to ?? '',
      durationMinutes: session ? String(session.durationMinutes) : '',
      notes: session?.notes ?? '',
    })
  }, [open, session, loggable?.to, form])

  const sessionDate = useWatch({ control: form.control, name: 'sessionDate' })
  const notes = useWatch({ control: form.control, name: 'notes' })

  // Time left in the chosen date's week (this session's own time counts as free when editing it).
  const week = sessionDate ? weekForDate(data.weeks, sessionDate) : undefined
  const ownMinutes =
    session && week?.sessions.some((s) => s.id === session.id) ? session.durationMinutes : 0
  const leftMinutes = Math.max(cap - (week?.loggedMinutes ?? 0) + ownMinutes, 0)

  const durationOptions = useMemo(
    () =>
      Array.from({ length: cap / UNIT_MINUTES }, (_, i) => {
        const minutes = (i + 1) * UNIT_MINUTES
        return { value: String(minutes), label: formatDuration(minutes) }
      }),
    [cap],
  )

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
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogTitle>{isEdit ? 'Edit session' : 'Log a session'}</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Log sessions in 15-minute units, up to {formatDuration(cap)} per week. Each week&apos;s
          sessions can be logged until Monday 11:59 PM ET.
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
                options={durationOptions}
                placeholder="Select duration"
                isSubmitting={isPending}
              />
            </div>
            {sessionDate && (
              <p className="-mt-2 text-xs text-muted-foreground">
                {leftMinutes > 0
                  ? `${formatDuration(leftMinutes)} left in this week.`
                  : 'This week has reached its weekly max.'}
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
                {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Log session'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
