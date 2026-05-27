'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'
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
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import {
  useAvailabilityOptions,
  useBudgetTypeOptions,
  useFormatOptions,
  useHireSupervisor,
  useStatesOptions,
  useSupervisorTypesData,
  useUserSnackbar,
} from '@/lib/hooks'
import { useConfetti } from '@/lib/hooks/useConfetti'
import { parseApiError } from '@/lib/utils/error-parser'
import { coerceStringList } from '@/lib/utils/profile-formatters'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

// ─── Validation schema ────────────────────────────────────────────────────────

const hireSupervisorSchema = z
  .object({
    supervisorId: z.string().min(1),
    preferredFormat: z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID'], {
      error: 'Preferred format is required',
    }),
    preferredAvailability: z.enum(
      ['FLEXIBLE', 'WEEKDAYS', 'EVENINGS', 'WEEKENDS', 'BY_APPOINTMENT'],
      { error: 'Preferred availability is required' },
    ),
    typeOfSupervisorNeeded: z.string().min(1, 'Please select a type of supervision needed'),
    stateTheyAreLookingIn: z
      .array(z.string())
      .min(1, 'Please select at least one state you are looking in'),
    preferredStartDate: z.string().min(1, 'Preferred start date is required'),
    budgetRangeType: z.enum(['PER_SESSION', 'MONTHLY'], {
      error: 'Budget type is required',
    }),
    budgetRangeStart: z.number({ error: 'Must be a number' }).min(0, 'Must be 0 or greater'),
    budgetRangeEnd: z.number({ error: 'Must be a number' }).min(0, 'Must be 0 or greater'),
    introMessage: z.string().min(1, 'Intro message is required'),
    goals: z.string().min(1, 'Goals for supervision are required'),
  })
  .refine((d) => d.budgetRangeEnd >= d.budgetRangeStart, {
    message: 'Max budget must be greater than or equal to min budget',
    path: ['budgetRangeEnd'],
  })

type HireSupervisorFormValues = z.infer<typeof hireSupervisorSchema>

function buildHireSupervisorDefaultValues(
  supervisorProfile: SupervisorProfileData,
  superviseeProfile: SuperviseeProfileData | null | undefined,
  supervisorTypeNames: ReadonlySet<string> = new Set(),
): DefaultValues<HireSupervisorFormValues> {
  const rawTypes = superviseeProfile
    ? coerceStringList(superviseeProfile.typeOfSupervisorNeeded)
    : []
  const matchedTypes =
    supervisorTypeNames.size > 0 ? rawTypes.filter((t) => supervisorTypeNames.has(t)) : rawTypes

  return {
    supervisorId: supervisorProfile.userId,
    preferredFormat: superviseeProfile?.preferredFormat ?? undefined,
    preferredAvailability:
      (superviseeProfile?.availability as HireSupervisorFormValues['preferredAvailability']) ??
      undefined,
    typeOfSupervisorNeeded: matchedTypes[0] ?? '',
    stateTheyAreLookingIn: superviseeProfile
      ? coerceStringList(superviseeProfile.stateTheyAreLookingIn)
      : [],
    preferredStartDate: '',
    budgetRangeType: superviseeProfile?.budgetRangeType ?? undefined,
    budgetRangeStart: superviseeProfile?.budgetRangeStart ?? 0,
    budgetRangeEnd: superviseeProfile?.budgetRangeEnd ?? 0,
    introMessage: '',
    goals: '',
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HireSupervisorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supervisorProfile: SupervisorProfileData
  superviseeProfile: SuperviseeProfileData | null | undefined
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HireSupervisorModal({
  open,
  onOpenChange,
  supervisorProfile,
  superviseeProfile,
}: HireSupervisorModalProps) {
  const { showSuccess, showError } = useUserSnackbar()
  const { burst } = useConfetti()
  const hireMutation = useHireSupervisor()

  // Option data from the backend options API (same sources as signup)
  const { data: formatOptions = [], isLoading: formatsLoading } = useFormatOptions()
  const { data: availabilityOptions = [], isLoading: availabilityLoading } =
    useAvailabilityOptions()
  const { data: supervisorTypesData = [], isLoading: supervisorTypesLoading } =
    useSupervisorTypesData()
  const supervisorTypeOptions = useMemo(
    () => supervisorTypesData.map((t) => ({ label: t.name, value: t.name })),
    [supervisorTypesData],
  )
  const supervisorTypeNames = useMemo(
    () => new Set(supervisorTypesData.map((t) => t.name)),
    [supervisorTypesData],
  )
  const { data: stateOptions = [], isLoading: statesLoading } = useStatesOptions()
  const { data: budgetTypeOptions = [], isLoading: budgetTypesLoading } = useBudgetTypeOptions()

  const optionsLoading =
    formatsLoading ||
    availabilityLoading ||
    supervisorTypesLoading ||
    statesLoading ||
    budgetTypesLoading

  const form = useForm<HireSupervisorFormValues>({
    resolver: zodResolver(hireSupervisorSchema),
    defaultValues: buildHireSupervisorDefaultValues(
      supervisorProfile,
      superviseeProfile,
      supervisorTypeNames,
    ),
  })

  useEffect(() => {
    if (open) {
      form.reset(
        buildHireSupervisorDefaultValues(supervisorProfile, superviseeProfile, supervisorTypeNames),
      )
    }
  }, [open, supervisorProfile, superviseeProfile, supervisorTypeNames, form])

  const { formState } = form
  const isSubmitting = formState.isSubmitting || hireMutation.isPending

  async function onSubmit(values: HireSupervisorFormValues) {
    try {
      await hireMutation.mutateAsync(values)
      burst()
      showSuccess('Hire request sent!', {
        description: 'Your request has been sent to the supervisor.',
      })
      onOpenChange(false)
      form.reset(
        buildHireSupervisorDefaultValues(supervisorProfile, superviseeProfile, supervisorTypeNames),
      )
    } catch (err) {
      showError(parseApiError(err))
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogTitle className="mb-1">Hire as Supervisor</DialogTitle>
        <p className="mb-5 text-sm text-muted-foreground">
          Tell the supervisor a bit about your needs. They&apos;ll review your request and respond.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Section: Supervision preferences ─────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-foreground">
                Supervision Preferences
              </legend>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormSelectField
                  control={form.control}
                  name="preferredFormat"
                  label="Preferred Format"
                  required
                  options={formatOptions}
                  loading={formatsLoading}
                  isSubmitting={isSubmitting}
                  placeholder="Select format"
                  rules={{ required: 'Preferred format is required' }}
                />

                <FormSelectField
                  control={form.control}
                  name="preferredAvailability"
                  label="Preferred Availability"
                  required
                  options={availabilityOptions}
                  loading={availabilityLoading}
                  isSubmitting={isSubmitting}
                  placeholder="Select availability"
                  rules={{ required: 'Preferred availability is required' }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <FormSelectField
                  control={form.control}
                  name="typeOfSupervisorNeeded"
                  label="Type of Supervision Needed"
                  required
                  options={supervisorTypeOptions}
                  loading={supervisorTypesLoading}
                  isSubmitting={isSubmitting}
                  placeholder={supervisorTypesLoading ? 'Loading…' : 'Select type of supervision'}
                  rules={{ required: 'Please select a type of supervision needed' }}
                />
                <FormField
                  control={form.control}
                  name="stateTheyAreLookingIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        State(s) You Are Looking In <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <TagInput
                          options={stateOptions}
                          value={field.value ?? []}
                          onChange={(v) => {
                            field.onChange(v)
                            form.clearErrors(field.name)
                          }}
                          placeholder={statesLoading ? 'Loading…' : 'Add a state (e.g. CA)'}
                          disabled={isSubmitting || statesLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormInputField
                control={form.control}
                name="preferredStartDate"
                label="Preferred Start Date"
                required
                type="date"
                isSubmitting={isSubmitting}
                rules={{ required: 'Preferred start date is required' }}
              />
            </fieldset>

            {/* ── Section: Budget ───────────────────────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-foreground">Budget</legend>

              <FormSelectField
                control={form.control}
                name="budgetRangeType"
                label="Budget Type"
                required
                options={budgetTypeOptions}
                loading={budgetTypesLoading}
                isSubmitting={isSubmitting}
                placeholder="Select budget type"
                rules={{ required: 'Budget type is required' }}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInputField
                  control={form.control}
                  name="budgetRangeStart"
                  label="Minimum ($)"
                  required
                  type="number"
                  numberValue
                  min={0}
                  step={1}
                  isSubmitting={isSubmitting}
                  placeholder="e.g. 50"
                  rules={{ required: 'Min budget is required' }}
                  startAdornment={<span className="text-muted-foreground">$</span>}
                />
                <FormInputField
                  control={form.control}
                  name="budgetRangeEnd"
                  label="Maximum ($)"
                  required
                  type="number"
                  numberValue
                  min={0}
                  step={1}
                  isSubmitting={isSubmitting}
                  placeholder="e.g. 200"
                  rules={{ required: 'Max budget is required' }}
                  startAdornment={<span className="text-muted-foreground">$</span>}
                />
              </div>
            </fieldset>

            {/* ── Section: Message ──────────────────────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-foreground">About You</legend>

              <FormField
                control={form.control}
                name="introMessage"
                rules={{ required: 'Intro message is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Introduction Message <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        placeholder='e.g. "I am a social worker seeking supervision to support my professional growth. I am reaching out because your background and experience align with the type of guidance I am looking for."'
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                rules={{ required: 'Goals for supervision are required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Goals for Supervision <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        placeholder="Describe what you hope to achieve through this supervision…"
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            {/* ── Actions ───────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || optionsLoading}>
                {isSubmitting ? 'Sending request…' : 'Send Hire Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
