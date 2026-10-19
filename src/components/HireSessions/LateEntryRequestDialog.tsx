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
import { useRequestLateEntry, useUserSnackbar } from '@/lib/hooks'
import { formatDuration, formatWeekRange, toEasternISODate } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import type { BillingWeek } from '@/types/sessions'

const NOTES_MAX = 1000
const UNIT_MINUTES = 15
const MAX_SESSION_MINUTES = 8 * 60
const DEFAULT_SESSION_MINUTES = 60

const schema = z.object({
  sessionDate: z.string().min(1, 'Session date is required'),
  durationMinutes: z.string().min(1, 'Choose how long the session was'),
  notes: z
    .string()
    .trim()
    .min(1, 'Add a short note about the session')
    .max(NOTES_MAX, `Keep notes under ${NOTES_MAX} characters`),
})

type FormValues = z.infer<typeof schema>

const DURATION_OPTIONS = Array.from({ length: MAX_SESSION_MINUTES / UNIT_MINUTES }, (_, i) => {
  const minutes = (i + 1) * UNIT_MINUTES
  return { value: String(minutes), label: formatDuration(minutes) }
})

/**
 * Supervisor's request to add a session to a week that already closed. Goes
 * to Gotham support (who add it in the admin panel); the supervisee then
 * approves it before it is charged. Nothing on the week changes here.
 */
export function LateEntryRequestDialog({
  hireId,
  week,
  counterpartName,
  open,
  onOpenChange,
}: {
  hireId: string
  week: BillingWeek
  counterpartName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { showSuccess, showError } = useUserSnackbar()
  const requestMutation = useRequestLateEntry(hireId)
  const isPending = requestMutation.isPending
  // Dates inside the closed week, never in the future.
  const today = toEasternISODate()
  const maxDate = week.endDate < today ? week.endDate : today

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionDate: '',
      durationMinutes: String(DEFAULT_SESSION_MINUTES),
      notes: '',
    },
  })
  const notes = useWatch({ control: form.control, name: 'notes' })

  useEffect(() => {
    if (open) {
      form.reset({ sessionDate: '', durationMinutes: String(DEFAULT_SESSION_MINUTES), notes: '' })
    }
  }, [open, form])

  const weekLabel = useMemo(() => formatWeekRange(week.startDate, week.endDate), [week])

  function onSubmit(values: FormValues) {
    requestMutation.mutate(
      {
        sessionDate: values.sessionDate,
        durationMinutes: Number(values.durationMinutes),
        notes: values.notes,
      },
      {
        onSuccess: () => {
          showSuccess('Request sent to support.', {
            description: `Once added, ${counterpartName} will be asked to approve it before it's charged.`,
          })
          onOpenChange(false)
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  return (
    <DialogRoot open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogTitle>Request a Late Entry</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          The week of {weekLabel} is closed. Support will add this session for you, and{' '}
          {counterpartName} will approve it before it&apos;s charged separately. Requests are
          accepted up to 14 days after the week ends.
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
                min={week.startDate}
                max={maxDate}
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
                      placeholder="Topics covered, and why it wasn't logged in time."
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
                {isPending ? 'Sending…' : 'Send Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
