'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import {
  HourlyQuoteSummary,
  HourlyQuoteSummarySkeleton,
} from '@/components/HirePayment/HourlyQuoteSummary'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Skeleton } from '@/components/ui/skeleton'
import { UploadFile } from '@/components/ui/upload-file'
import { previewAgreement } from '@/lib/api/supervision'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import {
  useHourlyQuote,
  usePayoutStatusQuery,
  useSupervisorProfile,
  useUserSnackbar,
} from '@/lib/hooks'
import { useProposeAgreement, useUpdateAgreement } from '@/lib/hooks/useHires'
import { toEasternISODate } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import { coerceStringList, formatDisplayName } from '@/lib/utils/profile-formatters'
import { isMedicalDirectorType } from '@/lib/utils/supervisee-eligibility'
import type { AgreementSource, HireListItem, ProposeAgreementInput } from '@/types/hire'

// ─── Validation schema ────────────────────────────────────────────────────────

export const MAX_AGREEMENT_DOC_SIZE_BYTES = 5 * 1024 * 1024
const MAX_AGREEMENT_DOC_SIZE_LABEL = '5 MB'

// Weekly cap bounds. Our own product ceiling, not a Stripe limit: the cap is
// prepaid as a real charge each week, so it bounds the supervisee's exposure.
// Mirrored by the backend validator and the quote hook.
const MIN_HOURS_PER_WEEK = 1
const MAX_HOURS_PER_WEEK = 40
const MIN_HOURLY_RATE = 1
const MAX_HOURLY_RATE = 10000

/** Whole hours within the weekly cap bounds (sessions are still logged in 15-minute units). */
function isValidWeeklyCap(hours: number | null | undefined): hours is number {
  return (
    hours != null &&
    Number.isInteger(hours) &&
    hours >= MIN_HOURS_PER_WEEK &&
    hours <= MAX_HOURS_PER_WEEK
  )
}

function isValidHourlyRate(rate: number | null | undefined): rate is number {
  return rate != null && rate >= MIN_HOURLY_RATE && rate <= MAX_HOURLY_RATE
}

/**
 * Terms are hourly when the hire is billed in-app (flag on, non-monthly
 * fee) — that's what the supervisee's weekly prepays are based on — and monthly
 * (paid outside the app) otherwise.
 */
function buildSendAgreementSchema(hasExistingUploadedFile: boolean, hourly: boolean) {
  const required = { error: 'Must be a number' }
  return z
    .object({
      source: z.enum(['DEFAULT_TEMPLATE', 'UPLOADED']),
      file: z.any().optional(),
      startDate: z.string().min(1, 'Start date is required'),
      supervisionMonths: hourly
        ? z.number().nullish()
        : z
            .number(required)
            .int('Must be a whole number of months')
            .min(1, 'Must be at least 1 month')
            .max(60, 'Must be 60 months or less'),
      monthlyAmount: hourly
        ? z.number().nullish()
        : z.number(required).min(1, 'Must be at least $1'),
      hourlyRate: hourly
        ? z
            .number(required)
            .min(MIN_HOURLY_RATE, 'Must be at least $1')
            .max(MAX_HOURLY_RATE, 'Must be $10,000 or less')
        : z.number().nullish(),
      maxHoursPerWeek: hourly
        ? z
            .number(required)
            .int('Use whole hours, e.g. 2')
            .min(MIN_HOURS_PER_WEEK, 'Must be at least 1 hour')
            .max(MAX_HOURS_PER_WEEK, 'Must be 40 hours or less')
        : z.number().nullish(),
      totalHours: hourly
        ? z
            .number()
            .int('Must be a whole number of hours')
            .min(1, 'Must be at least 1 hour')
            .max(10000, 'Must be 10,000 hours or less')
            .nullish()
        : z.number().nullish(),
      signatureName: z.string().min(1, 'Please type your full legal name'),
      consent: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.source === 'UPLOADED') {
        if (data.file instanceof File) {
          if (data.file.size > MAX_AGREEMENT_DOC_SIZE_BYTES) {
            ctx.addIssue({
              code: 'custom',
              path: ['file'],
              message: `File is too large. Please upload a file under ${MAX_AGREEMENT_DOC_SIZE_LABEL}.`,
            })
          }
        } else if (!hasExistingUploadedFile) {
          ctx.addIssue({
            code: 'custom',
            path: ['file'],
            message: 'Please upload your agreement document',
          })
        }
      }
      // Hourly agreements are billed in-app from the start date, so it can't be
      // in the past (the backend enforces the same, in US Eastern time).
      if (hourly && data.startDate && data.startDate < toEasternISODate()) {
        ctx.addIssue({
          code: 'custom',
          path: ['startDate'],
          message: "Start date can't be in the past",
        })
      }
      if (!data.consent) {
        ctx.addIssue({
          code: 'custom',
          path: ['consent'],
          message: 'You must agree to sign this agreement',
        })
      }
    })
}

type SendAgreementFormValues = z.infer<ReturnType<typeof buildSendAgreementSchema>>

function toDateInputValue(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : ''
}

/** The later of two YYYY-MM-DD dates (an empty date counts as earliest). */
function laterDate(a: string, b: string): string {
  return a > b ? a : b
}

/**
 * Start date to prefill. A new agreement starts from the supervisee's requested
 * date, moved up to today when the request was accepted after it passed. An
 * edit keeps the proposed date, except an hourly one that has since passed
 * (hourly agreements can't start in the past).
 */
function defaultStartDate(hire: HireListItem): string {
  const today = toEasternISODate()
  const agreement = hire.agreement
  if (agreement) {
    const proposed = toDateInputValue(agreement.startDate)
    return agreement.hourlyRateCents != null ? laterDate(proposed, today) : proposed
  }
  return laterDate(toDateInputValue(hire.startDate ?? hire.preferredStartDate), today)
}

function buildDefaultValues(hire: HireListItem): SendAgreementFormValues {
  const agreement = hire.agreement
  return {
    source: agreement?.source ?? 'DEFAULT_TEMPLATE',
    file: undefined,
    startDate: defaultStartDate(hire),
    supervisionMonths: agreement?.supervisionMonths ?? hire.supervisionMonths ?? 6,
    monthlyAmount:
      agreement?.monthlyAmount != null
        ? Number(agreement.monthlyAmount)
        : hire.monthlyAmount != null
          ? Number(hire.monthlyAmount)
          : 0,
    // Hourly terms: an edit keeps the proposed ones; a new agreement starts from the
    // supervisor's listed hourly fee (stored in dollars) and the requested hours.
    hourlyRate:
      agreement?.hourlyRateCents != null
        ? agreement.hourlyRateCents / 100
        : hire.supervisorFeeType?.toUpperCase() === 'HOURLY' && hire.supervisorFeeAmount
          ? hire.supervisorFeeAmount
          : null,
    maxHoursPerWeek: agreement?.weeklyCapMinutes != null ? agreement.weeklyCapMinutes / 60 : null,
    totalHours: agreement ? agreement.totalHours : hire.supervisionHours,
    signatureName: '',
    consent: false,
  }
}

/** A hire made for the Medical Director role uses the platform's Medical Director template. */
function isMedicalDirectorHire(hire: HireListItem): boolean {
  return coerceStringList(hire.typeOfSupervisorNeeded).some((name) =>
    isMedicalDirectorType({ name }),
  )
}

function getSourceOptions(
  hire: HireListItem,
): { value: AgreementSource; label: string; description: string }[] {
  const templateName = isMedicalDirectorHire(hire)
    ? 'medical director agreement'
    : 'supervision agreement'
  return [
    {
      value: 'DEFAULT_TEMPLATE',
      label: 'Use the default agreement',
      description: `The platform's standard ${templateName}, applied with your terms below.`,
    },
    {
      value: 'UPLOADED',
      label: 'Upload my own',
      description: 'Use your own agreement document (PDF, JPG, or PNG).',
    },
  ]
}

/** The term fields the backend expects for the current billing mode. */
function termsInput(
  values: SendAgreementFormValues,
  hourly: boolean,
): Pick<
  ProposeAgreementInput,
  'supervisionMonths' | 'monthlyAmount' | 'hourlyRate' | 'maxHoursPerWeek' | 'totalHours'
> {
  return hourly
    ? {
        hourlyRate: values.hourlyRate ?? undefined,
        maxHoursPerWeek: values.maxHoursPerWeek ?? undefined,
        totalHours: values.totalHours ?? undefined,
      }
    : {
        supervisionMonths: values.supervisionMonths ?? undefined,
        monthlyAmount: values.monthlyAmount ?? undefined,
      }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SendAgreementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hire: HireListItem
}

/**
 * Supervisor-side modal to propose (or edit an unsigned) agreement: pick the
 * document source, set the terms, and e-sign. Editing bumps the version — the
 * supervisee always signs the latest version.
 */
export function SendAgreementModal({ open, onOpenChange, hire }: SendAgreementModalProps) {
  const { showSuccess, showError } = useUserSnackbar()
  const proposeMutation = useProposeAgreement()
  const updateMutation = useUpdateAgreement()

  const isEdit = hire.agreement != null
  const superviseeName = formatDisplayName(hire.supervisee)
  const sourceOptions = useMemo(() => getSourceOptions(hire), [hire])
  const hasExistingUploadedFile =
    hire.agreement?.source === 'UPLOADED' && hire.agreement.fileUrl != null

  // Billing follows the supervisor's current fee type (the backend makes the same
  // call): hourly is billed in-app; monthly (Medical Directors, and fees saved as
  // monthly before it was retired for other supervisors) stays on monthly terms.
  const { data: myProfile, isLoading: profileLoading } = useSupervisorProfile(open)
  const feeType = myProfile?.supervisionFeeType ?? hire.supervisorFeeType
  const hourly = IN_APP_PAYMENTS_ENABLED && feeType?.toUpperCase() !== 'MONTHLY'
  const payoutStatus = usePayoutStatusQuery(open && hourly)
  const termsLoading =
    (IN_APP_PAYMENTS_ENABLED && profileLoading) || (hourly && payoutStatus.isLoading)
  // Billed agreements need the supervisor's payout account (the backend enforces it too).
  const payoutsReady = !hourly || payoutStatus.data?.status === 'ready'

  const schema = useMemo(
    () => buildSendAgreementSchema(hasExistingUploadedFile, hourly),
    [hasExistingUploadedFile, hourly],
  )

  const form = useForm<SendAgreementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(hire),
  })

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(hire))
    }
  }, [open, hire, form])

  const source = useWatch({ control: form.control, name: 'source' })
  const hourlyRate = useWatch({ control: form.control, name: 'hourlyRate' })
  const maxHoursPerWeek = useWatch({ control: form.control, name: 'maxHoursPerWeek' })

  // Debounced so the breakdown isn't re-fetched on every keystroke.
  const [quoteTerms, setQuoteTerms] = useState<{ rate: number | null; cap: number | null }>({
    rate: null,
    cap: null,
  })
  useEffect(() => {
    const id = setTimeout(
      () => setQuoteTerms({ rate: hourlyRate ?? null, cap: maxHoursPerWeek ?? null }),
      300,
    )
    return () => clearTimeout(id)
  }, [hourlyRate, maxHoursPerWeek])
  const { data: quote } = useHourlyQuote(quoteTerms.rate, quoteTerms.cap, open && hourly)
  // The quote only refetches for valid terms, so without this the breakdown would
  // keep showing the last valid cap (e.g. 20 h) after the user types 50.
  const termsValid = isValidHourlyRate(hourlyRate) && isValidWeeklyCap(maxHoursPerWeek)
  const quoteMatchesTerms =
    termsValid && quoteTerms.rate === hourlyRate && quoteTerms.cap === maxHoursPerWeek
  const capHint =
    maxHoursPerWeek == null
      ? null
      : maxHoursPerWeek > MAX_HOURS_PER_WEEK
        ? `Max is ${MAX_HOURS_PER_WEEK} hours per week. The supervisee prepays this cap every week, so it's capped to limit their weekly charge.`
        : maxHoursPerWeek < MIN_HOURS_PER_WEEK
          ? `Must be at least ${MIN_HOURS_PER_WEEK} hour.`
          : !Number.isInteger(maxHoursPerWeek)
            ? 'Use whole hours, e.g. 2 or 3. Sessions are still logged in 15-minute units.'
            : null

  useEffect(() => {
    if (source !== 'UPLOADED') {
      form.setValue('file', undefined)
      form.clearErrors('file')
    }
  }, [source, form])

  const isSubmitting =
    form.formState.isSubmitting || proposeMutation.isPending || updateMutation.isPending

  // ── Preview ────────────────────────────────────────────────────────────
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  function handlePreviewOpenChange(open: boolean) {
    if (!open && previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    if (!open) setPreviewUrl(null)
    setPreviewOpen(open)
  }

  async function handlePreview() {
    if (source === 'UPLOADED') {
      const file = form.getValues('file')
      if (file instanceof File) {
        setPreviewUrl(URL.createObjectURL(file))
        setPreviewOpen(true)
      } else if (hasExistingUploadedFile && hire.agreement?.fileUrl) {
        setPreviewUrl(hire.agreement.fileUrl)
        setPreviewOpen(true)
      } else {
        void form.trigger('file')
      }
      return
    }

    // Default template: the backend renders the exact PDF it would send.
    const termsValid = await form.trigger(
      hourly
        ? ['startDate', 'hourlyRate', 'maxHoursPerWeek', 'totalHours']
        : ['startDate', 'supervisionMonths', 'monthlyAmount'],
    )
    if (!termsValid) return
    const values = form.getValues()
    setPreviewLoading(true)
    try {
      const blob = await previewAgreement(hire.id, {
        startDate: values.startDate,
        ...termsInput(values, hourly),
        signatureName: values.signatureName.trim() || undefined,
      })
      setPreviewUrl(URL.createObjectURL(blob))
      setPreviewOpen(true)
    } catch (err) {
      showError(parseApiError(err))
    } finally {
      setPreviewLoading(false)
    }
  }

  async function onSubmit(values: SendAgreementFormValues) {
    const input: ProposeAgreementInput = {
      source: values.source,
      file: values.source === 'UPLOADED' && values.file instanceof File ? values.file : null,
      startDate: values.startDate,
      ...termsInput(values, hourly),
      signatureName: values.signatureName,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ hireId: hire.id, input })
        showSuccess('Agreement updated!', {
          description: `${superviseeName} will be asked to sign the new version.`,
        })
      } else {
        await proposeMutation.mutateAsync({ hireId: hire.id, input })
        showSuccess('Agreement sent!', {
          description: `${superviseeName} will review and sign your agreement.`,
        })
      }
      onOpenChange(false)
    } catch (err) {
      showError(parseApiError(err))
    }
  }

  return (
    <>
      <DialogRoot open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
        <DialogContent className="max-h-[90vh] max-w-xl">
          <DialogTitle className="mb-1">{isEdit ? 'Edit Agreement' : 'Send Agreement'}</DialogTitle>
          <p className="mb-5 text-sm text-muted-foreground">
            {isEdit
              ? `Editing creates a new version and re-signs it — ${superviseeName} will need to sign again.`
              : `Set the terms of your supervision with ${superviseeName}. They'll review and countersign before supervision begins.`}
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ── Section: Document ─────────────────────────────────────── */}
              {/* min-w-0 overrides the fieldset default min-inline-size:min-content, which
                otherwise lets an unbroken filename stretch the whole dialog */}
              <fieldset className="min-w-0 space-y-4">
                <legend className="text-sm font-semibold text-foreground">
                  Agreement Document
                </legend>

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          role="radiogroup"
                          aria-label="Agreement document source"
                          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                        >
                          {sourceOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              role="radio"
                              aria-checked={field.value === opt.value}
                              disabled={isSubmitting}
                              onClick={() => field.onChange(opt.value)}
                              className={`rounded-lg border p-3 text-left transition-colors ${
                                field.value === opt.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              <p className="text-sm font-medium text-foreground">{opt.label}</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                {opt.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {source === 'UPLOADED' && (
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, onBlur, ref } }) => (
                      <FormItem>
                        <FormLabel>
                          Agreement Document{' '}
                          {!hasExistingUploadedFile && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                          <UploadFile
                            inputRef={ref}
                            value={value}
                            onChange={(file) => {
                              onChange(file)
                              void form.trigger('file')
                            }}
                            onBlur={onBlur}
                            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
                            uploadTitle={
                              hasExistingUploadedFile
                                ? 'Replace agreement document'
                                : 'Upload agreement document'
                            }
                            uploadHint={
                              hasExistingUploadedFile
                                ? 'PDF, JPG, or PNG (max 5 MB) · Leave empty to keep the current document'
                                : 'PDF, JPG, or PNG (max 5 MB) · Click to browse'
                            }
                            removeFileAriaLabel="Remove agreement document"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </fieldset>

              {/* ── Section: Terms ────────────────────────────────────────── */}
              <fieldset className="min-w-0 space-y-4">
                <legend className="text-sm font-semibold text-foreground">Terms</legend>

                <FormInputField
                  control={form.control}
                  name="startDate"
                  label="Supervision Start Date"
                  required
                  type="date"
                  min={hourly ? toEasternISODate() : undefined}
                  clearErrorsOnChange
                  isSubmitting={isSubmitting}
                  rules={{ required: 'Start date is required' }}
                />

                {termsLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : hourly ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormInputField
                        control={form.control}
                        name="hourlyRate"
                        label="Hourly Rate ($)"
                        required
                        type="number"
                        numberValue
                        clearErrorsOnChange
                        min={1}
                        step={0.01}
                        isSubmitting={isSubmitting}
                        placeholder="e.g. 100"
                        startAdornment={<span className="text-muted-foreground">$</span>}
                      />
                      <FormInputField
                        control={form.control}
                        name="maxHoursPerWeek"
                        label="Max Hours / Week"
                        required
                        type="number"
                        numberValue
                        clearErrorsOnChange
                        min={MIN_HOURS_PER_WEEK}
                        max={MAX_HOURS_PER_WEEK}
                        step={1}
                        isSubmitting={isSubmitting}
                        placeholder="e.g. 2"
                      />
                      <FormInputField
                        control={form.control}
                        name="totalHours"
                        label="Total Hours"
                        type="number"
                        numberValue
                        clearErrorsOnChange
                        min={1}
                        step={1}
                        isSubmitting={isSubmitting}
                        placeholder="e.g. 200"
                      />
                    </div>
                    {/* Fixed-height slot: summary, skeleton while (re)quoting, or the
                        cap hint — so editing the terms never shifts the form. */}
                    <div className="min-h-[11.5rem]">
                      {capHint ? (
                        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                          {capHint}
                        </p>
                      ) : !termsValid ? (
                        <p className="flex min-h-[11.5rem] items-center justify-center rounded-lg border border-dashed px-4 text-center text-xs text-muted-foreground">
                          Enter an hourly rate and max hours per week to see your breakdown.
                        </p>
                      ) : quote && quoteMatchesTerms ? (
                        <HourlyQuoteSummary quote={quote} perspective="supervisor" />
                      ) : (
                        <HourlyQuoteSummarySkeleton perspective="supervisor" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You log each session in the app (in 15-minute units) and are paid for the
                      hours {superviseeName} approves, up to the weekly max. Leave Total Hours empty
                      if the agreement runs until either of you ends it. Payouts go to your bank
                      account via Stripe.
                    </p>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormInputField
                      control={form.control}
                      name="supervisionMonths"
                      label="Number of Months Needed"
                      required
                      type="number"
                      numberValue
                      clearErrorsOnChange
                      min={1}
                      max={60}
                      step={1}
                      isSubmitting={isSubmitting}
                      placeholder="e.g. 6"
                      rules={{ required: 'Number of months is required' }}
                    />
                    <FormInputField
                      control={form.control}
                      name="monthlyAmount"
                      label="Monthly Amount ($)"
                      required
                      type="number"
                      numberValue
                      clearErrorsOnChange
                      min={1}
                      step={1}
                      isSubmitting={isSubmitting}
                      placeholder="e.g. 400"
                      rules={{ required: 'Monthly amount is required' }}
                      startAdornment={<span className="text-muted-foreground">$</span>}
                    />
                  </div>
                )}
              </fieldset>

              {/* ── Section: Signature ────────────────────────────────────── */}
              <fieldset className="min-w-0 space-y-4">
                <legend className="text-sm font-semibold text-foreground">Your Signature</legend>

                <FormInputField
                  control={form.control}
                  name="signatureName"
                  label="Full Legal Name"
                  required
                  type="text"
                  isSubmitting={isSubmitting}
                  placeholder="e.g. Jane M. Doe"
                  rules={{ required: 'Please type your full legal name' }}
                />

                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <span>
                          I agree that typing my name above constitutes my electronic signature and
                          that I intend to be bound by this agreement.
                        </span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>

              {hourly && payoutStatus.data && !payoutsReady && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Set up payouts before sending an agreement, so {superviseeName} can pay you
                    through the platform.{' '}
                    <Link href="/billing?tab=earnings" className="font-medium underline">
                      Go to Billing &amp; Invoices
                    </Link>
                  </span>
                </div>
              )}

              {/* ── Actions ───────────────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || previewLoading}
                  onClick={handlePreview}
                >
                  {previewLoading ? 'Preparing…' : 'Preview'}
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !payoutsReady}>
                    {isSubmitting
                      ? 'Sending…'
                      : isEdit
                        ? 'Save & Re-send'
                        : 'Sign & Send Agreement'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={previewOpen} onOpenChange={handlePreviewOpenChange}>
        <DialogContent
          className="h-[85vh] max-w-3xl"
          bodyClassName="flex flex-col"
          header={
            <>
              <DialogTitle>Agreement Preview</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                This is exactly what {superviseeName} will receive.
              </p>
            </>
          }
        >
          {previewUrl && (
            /* Fragment fits the whole page on open (Chrome: view=Fit, Firefox: zoom=page-fit)
               so older users see the full document without fiddling with zoom. */
            <iframe
              src={`${previewUrl}#view=Fit&zoom=page-fit`}
              title="Agreement preview"
              className="min-h-0 w-full flex-1 rounded-md border bg-muted/30"
            />
          )}
        </DialogContent>
      </DialogRoot>
    </>
  )
}
