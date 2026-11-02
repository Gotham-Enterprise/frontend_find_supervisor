'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
import { useUserSnackbar } from '@/lib/hooks'
import { useCreateActivityEntry, useUpdateActivityEntry } from '@/lib/hooks/useActivityLog'
import { formatDuration } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import type { ActivityEntry, ActivityType, HireActivityLog } from '@/types/activity-log'

import { ACTIVITY_TYPE_LABELS } from './activity-types'

const NOTES_MAX = 1000
const UNIT_MINUTES = 15
const MAX_MINUTES = 8 * 60
const MAX_CHARTS = 1000
const NO_DURATION = 'none'

const TYPE_OPTIONS = (Object.keys(ACTIVITY_TYPE_LABELS) as ActivityType[]).map((type) => ({
  value: type,
  label: ACTIVITY_TYPE_LABELS[type],
}))

const DURATION_OPTIONS = [
  { value: NO_DURATION, label: 'Not recorded' },
  ...Array.from({ length: MAX_MINUTES / UNIT_MINUTES }, (_, i) => {
    const minutes = (i + 1) * UNIT_MINUTES
    return { value: String(minutes), label: formatDuration(minutes) }
  }),
]

const entrySchema = z
  .object({
    activityDate: z.string().min(1, 'Date is required'),
    type: z.string().min(1, 'Choose what you did'),
    durationMinutes: z.string(),
    chartCount: z.string().trim(),
    notes: z.string().trim().max(NOTES_MAX, `Keep notes under ${NOTES_MAX} characters`),
  })
  // Charts reviewed only counts (and is only shown) for a chart review.
  .refine(
    (v) =>
      v.type !== 'CHART_REVIEW' ||
      v.chartCount === '' ||
      (/^\d+$/.test(v.chartCount) &&
        Number(v.chartCount) >= 1 &&
        Number(v.chartCount) <= MAX_CHARTS),
    { path: ['chartCount'], message: `Enter 1 to ${MAX_CHARTS.toLocaleString('en-US')}` },
  )
  .refine((v) => v.type !== 'OTHER' || v.notes.length > 0, {
    path: ['notes'],
    message: 'Describe the activity',
  })

type EntryFormValues = z.infer<typeof entrySchema>

/**
 * The Medical Director logs (or edits) one activity for a client: date (this
 * month or last), what it was, and optionally how long, how many charts, and
 * notes. The backend enforces the window and the month locks too.
 */
export function ActivityEntryDialog({
  hireId,
  log,
  entry,
  clientName,
  open,
  onOpenChange,
}: {
  hireId: string
  log: HireActivityLog
  /** Set when editing an existing entry. */
  entry?: ActivityEntry
  clientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { showSuccess, showError } = useUserSnackbar()
  const createMutation = useCreateActivityEntry(hireId)
  const updateMutation = useUpdateActivityEntry(hireId)
  const isEdit = entry != null
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      activityDate: '',
      type: 'MEETING',
      durationMinutes: NO_DURATION,
      chartCount: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      activityDate: entry?.activityDate ?? log.window.latestDate,
      type: entry?.type ?? 'MEETING',
      durationMinutes: entry?.durationMinutes ? String(entry.durationMinutes) : NO_DURATION,
      chartCount: entry?.chartCount ? String(entry.chartCount) : '',
      notes: entry?.notes ?? '',
    })
  }, [open, entry, log.window.latestDate, form])

  const type = useWatch({ control: form.control, name: 'type' })
  const notes = useWatch({ control: form.control, name: 'notes' })

  async function onSubmit(values: EntryFormValues) {
    const input = {
      activityDate: values.activityDate,
      type: values.type as ActivityType,
      durationMinutes:
        values.durationMinutes === NO_DURATION ? null : Number(values.durationMinutes),
      chartCount:
        values.type === 'CHART_REVIEW' && values.chartCount ? Number(values.chartCount) : null,
      notes: values.notes.trim() || null,
    }
    try {
      if (entry) {
        await updateMutation.mutateAsync({ entryId: entry.id, input })
        showSuccess('Activity updated')
      } else {
        await createMutation.mutateAsync(input)
        showSuccess('Activity logged', { description: `${clientName} can see it in their log.` })
      }
      onOpenChange(false)
    } catch (err) {
      showError(parseApiError(err))
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-md">
        <DialogTitle>{isEdit ? 'Edit Activity' : 'Log Activity'}</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          A record of your work for {clientName}, which they can see. It doesn&apos;t affect
          billing. You can log activity from this month and last month.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInputField
                control={form.control}
                name="activityDate"
                label="Date"
                required
                type="date"
                min={log.window.earliestDate}
                max={log.window.latestDate}
                clearErrorsOnChange
                isSubmitting={isPending}
              />
              <FormSelectField
                control={form.control}
                name="type"
                label="Activity"
                required
                options={TYPE_OPTIONS}
                isSubmitting={isPending}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelectField
                control={form.control}
                name="durationMinutes"
                label="Time spent"
                options={DURATION_OPTIONS}
                isSubmitting={isPending}
              />
              {type === 'CHART_REVIEW' && (
                <FormInputField
                  control={form.control}
                  name="chartCount"
                  label="Charts reviewed"
                  type="number"
                  min={1}
                  max={MAX_CHARTS}
                  step={1}
                  clearErrorsOnChange
                  isSubmitting={isPending}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes {type === 'OTHER' && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      maxLength={NOTES_MAX}
                      placeholder="What was covered, e.g. reviewed Botox protocol and standing orders. Don't include patient names or other patient-identifying information."
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
                {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Activity'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
