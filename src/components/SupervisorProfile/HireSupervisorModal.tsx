'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import type { DefaultValues } from 'react-hook-form'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useAvailabilityOptions,
  useBudgetTypeOptions,
  useFormatOptions,
  useHireSupervisor,
  useUserSnackbar,
} from '@/lib/hooks'
import { useConfetti } from '@/lib/hooks/useConfetti'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  coerceStringList,
  isValidSupervisionHoursInput,
  parseSupervisionHoursInput,
  requiresSupervisionHours,
} from '@/lib/utils/profile-formatters'
import {
  MEDICAL_DIRECTOR_TYPE_NAME,
  supervisionTypeDisplayLabel,
} from '@/lib/utils/supervisee-eligibility'
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
    preferredStartDate: z.string().min(1, 'Preferred start date is required'),
    budgetRangeType: z.enum(['HOURLY', 'MONTHLY'], {
      error: 'Budget type is required',
    }),
    budgetRangeStart: z.number({ error: 'Must be a number' }).min(0, 'Must be 0 or greater'),
    budgetRangeEnd: z.number({ error: 'Must be a number' }).min(0, 'Must be 0 or greater'),
    introMessage: z.string().min(1, 'Intro message is required'),
    goals: z.string().min(1, 'Goals for supervision are required'),
    supervisionHours: z.string().optional(),
  })
  .refine((d) => d.budgetRangeEnd >= d.budgetRangeStart, {
    message: 'Max budget must be greater than or equal to min budget',
    path: ['budgetRangeEnd'],
  })
  .superRefine((data, ctx) => {
    if (!requiresSupervisionHours(data.typeOfSupervisorNeeded)) return
    const raw = data.supervisionHours?.trim() ?? ''
    if (!raw || !isValidSupervisionHoursInput(raw)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid whole number of hours (no leading zeros)',
        path: ['supervisionHours'],
      })
    }
  })

type HireSupervisorFormValues = z.infer<typeof hireSupervisorSchema>

function buildHireSupervisorDefaultValues(
  supervisorProfile: SupervisorProfileData,
  superviseeProfile: SuperviseeProfileData | null | undefined,
  supervisorTypeNames: ReadonlySet<string> = new Set(),
  hireContext: HireContext = 'supervisor',
): DefaultValues<HireSupervisorFormValues> {
  const rawTypes = superviseeProfile
    ? coerceStringList(superviseeProfile.typeOfSupervisorNeeded)
    : []
  const hireable = [...supervisorTypeNames]
  const matchedTypes =
    hireable.length > 0 ? rawTypes.filter((t) => supervisorTypeNames.has(t)) : rawTypes

  return {
    supervisorId: supervisorProfile.userId,
    preferredFormat: superviseeProfile?.preferredFormat ?? undefined,
    preferredAvailability:
      (superviseeProfile?.availability as HireSupervisorFormValues['preferredAvailability']) ??
      undefined,
    typeOfSupervisorNeeded: matchedTypes[0] ?? (hireable.length === 1 ? hireable[0] : ''),
    preferredStartDate: '',
    // Hiring a Medical Director prefills from the MD preference block (monthly-only);
    // other hires keep the supervision-side budget.
    ...(hireContext === 'medical-director'
      ? {
          budgetRangeType: 'MONTHLY' as const,
          budgetRangeStart: 0,
          budgetRangeEnd: superviseeProfile?.mdMonthlyBudget ?? 0,
        }
      : {
          budgetRangeType: superviseeProfile?.budgetRangeType ?? undefined,
          budgetRangeStart: superviseeProfile?.budgetRangeStart ?? 0,
          budgetRangeEnd: superviseeProfile?.budgetRangeEnd ?? 0,
        }),
    introMessage: '',
    goals: '',
    supervisionHours: '',
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

/** Which role the supervisee is hiring for — driven by the page they came
 *  from, not the supervisor's primary type (a Medical Director offering
 *  supervision is hired "as Supervisor" from /find-supervisors). */
export type HireContext = 'supervisor' | 'medical-director'

interface HireSupervisorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supervisorProfile: SupervisorProfileData
  superviseeProfile: SuperviseeProfileData | null | undefined
  hireContext: HireContext
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HireSupervisorModal({
  open,
  onOpenChange,
  supervisorProfile,
  superviseeProfile,
  hireContext,
}: HireSupervisorModalProps) {
  const { showSuccess, showError } = useUserSnackbar()
  const { burst } = useConfetti()
  const hireMutation = useHireSupervisor()

  // Option data from the backend options API (same sources as signup)
  const { data: formatOptions = [], isLoading: formatsLoading } = useFormatOptions()
  const { data: availabilityOptions = [], isLoading: availabilityLoading } =
    useAvailabilityOptions()
  const isMdHire = hireContext === 'medical-director'

  // The hire targets a role THIS supervisor actually provides, per the page
  // context: 'medical-director' locks to Medical Director; 'supervisor' offers
  // the supervisor's non-MD roles (primary type and/or physician offerings).
  const hireableTypeNames = useMemo(() => {
    if (hireContext === 'medical-director') return [MEDICAL_DIRECTOR_TYPE_NAME]
    const roles = new Set<string>()
    const primary = supervisorProfile.supervisorType?.trim()
    if (primary && primary !== MEDICAL_DIRECTOR_TYPE_NAME) roles.add(primary)
    for (const offering of supervisorProfile.offerings ?? []) {
      const name = offering.supervisorType?.trim()
      if (name && name !== MEDICAL_DIRECTOR_TYPE_NAME) roles.add(name)
    }
    if (roles.size === 0 && primary) roles.add(primary)
    return [...roles]
  }, [hireContext, supervisorProfile])

  const supervisorTypeOptions = useMemo(
    () =>
      hireableTypeNames.map((name) => ({ label: supervisionTypeDisplayLabel(name), value: name })),
    [hireableTypeNames],
  )
  const supervisorTypeNames = useMemo(() => new Set(hireableTypeNames), [hireableTypeNames])
  const { data: budgetTypeOptions = [], isLoading: budgetTypesLoading } = useBudgetTypeOptions()

  const optionsLoading = formatsLoading || availabilityLoading || budgetTypesLoading

  const form = useForm<HireSupervisorFormValues>({
    resolver: zodResolver(hireSupervisorSchema),
    defaultValues: buildHireSupervisorDefaultValues(
      supervisorProfile,
      superviseeProfile,
      supervisorTypeNames,
      hireContext,
    ),
  })

  useEffect(() => {
    if (open) {
      form.reset(
        buildHireSupervisorDefaultValues(
          supervisorProfile,
          superviseeProfile,
          supervisorTypeNames,
          hireContext,
        ),
      )
    }
  }, [open, supervisorProfile, superviseeProfile, supervisorTypeNames, hireContext, form])

  const typeOfSupervisorNeeded = useWatch({
    control: form.control,
    name: 'typeOfSupervisorNeeded',
  })
  const showSupervisionHours = requiresSupervisionHours(typeOfSupervisorNeeded)

  useEffect(() => {
    if (!showSupervisionHours) {
      form.setValue('supervisionHours', '')
      form.clearErrors('supervisionHours')
    }
  }, [showSupervisionHours, form])

  const { formState } = form
  const isSubmitting = formState.isSubmitting || hireMutation.isPending

  async function onSubmit(values: HireSupervisorFormValues) {
    try {
      await hireMutation.mutateAsync({
        ...values,
        supervisionHours: showSupervisionHours
          ? parseSupervisionHoursInput(values.supervisionHours)
          : null,
      })
      burst()
      showSuccess('Hire request sent!', {
        description: 'Your request has been sent to the supervisor.',
      })
      onOpenChange(false)
      form.reset(
        buildHireSupervisorDefaultValues(
          supervisorProfile,
          superviseeProfile,
          supervisorTypeNames,
          hireContext,
        ),
      )
    } catch (err) {
      showError(parseApiError(err))
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogTitle className="mb-1">
          {hireContext === 'medical-director' ? 'Hire as Medical Director' : 'Hire as Supervisor'}
        </DialogTitle>
        <p className="mb-5 text-sm text-muted-foreground">
          {hireContext === 'medical-director'
            ? 'Tell the medical director a bit about your needs. They’ll review your request and respond.'
            : 'Tell the supervisor a bit about your needs. They’ll review your request and respond.'}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Section: Supervision preferences ─────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-foreground">
                {isMdHire ? 'Medical Director Preferences' : 'Supervision Preferences'}
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
                  label={isMdHire ? 'Type of Service Needed' : 'Type of Supervision Needed'}
                  required
                  options={supervisorTypeOptions}
                  // Fixed when the supervisor provides exactly one matching role
                  disabled={supervisorTypeOptions.length === 1}
                  isSubmitting={isSubmitting}
                  placeholder="Select type of supervision"
                  rules={{ required: 'Please select a type of supervision needed' }}
                />
                {showSupervisionHours && (
                  <FormField
                    control={form.control}
                    name="supervisionHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Supervision Hours Needed <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            disabled={isSubmitting}
                            placeholder="e.g. 100"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const next = e.target.value
                              if (next === '' || isValidSupervisionHoursInput(next)) {
                                field.onChange(next)
                                form.clearErrors('supervisionHours')
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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

              {/* Medical Directors are monthly-only: type locked, one amount
                  (stored in budgetRangeEnd; start stays 0 like everywhere else) */}
              <FormSelectField
                control={form.control}
                name="budgetRangeType"
                label="Budget Type"
                required
                options={
                  isMdHire
                    ? budgetTypeOptions.filter((o) => o.value === 'MONTHLY')
                    : budgetTypeOptions
                }
                disabled={isMdHire}
                loading={budgetTypesLoading}
                isSubmitting={isSubmitting}
                placeholder="Select budget type"
                rules={{ required: 'Budget type is required' }}
              />

              {isMdHire ? (
                <FormInputField
                  control={form.control}
                  name="budgetRangeEnd"
                  label="Monthly Budget ($)"
                  required
                  type="number"
                  numberValue
                  min={1}
                  step={1}
                  isSubmitting={isSubmitting}
                  placeholder="e.g. 2000"
                  rules={{ required: 'Monthly budget is required' }}
                  startAdornment={<span className="text-muted-foreground">$</span>}
                />
              ) : (
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
              )}
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
                        placeholder={
                          isMdHire
                            ? 'e.g. "I run a wellness practice and am looking for a medical director to provide oversight. I am reaching out because your background aligns with what our practice needs."'
                            : 'e.g. "I am a social worker seeking supervision to support my professional growth. I am reaching out because your background and experience align with the type of guidance I am looking for."'
                        }
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
                      {isMdHire ? 'Goals for the Engagement' : 'Goals for Supervision'}{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        placeholder={
                          isMdHire
                            ? 'Describe what you hope to achieve through this engagement…'
                            : 'Describe what you hope to achieve through this supervision…'
                        }
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
