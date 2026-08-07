'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

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
import { UploadFile } from '@/components/ui/upload-file'
import { previewAgreement } from '@/lib/api/supervision'
import { useUserSnackbar } from '@/lib/hooks'
import { useProposeAgreement, useUpdateAgreement } from '@/lib/hooks/useHires'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatDisplayName } from '@/lib/utils/profile-formatters'
import type { AgreementSource, HireListItem, ProposeAgreementInput } from '@/types/hire'

// ─── Validation schema ────────────────────────────────────────────────────────

export const MAX_AGREEMENT_DOC_SIZE_BYTES = 5 * 1024 * 1024
const MAX_AGREEMENT_DOC_SIZE_LABEL = '5 MB'

function buildSendAgreementSchema(hasExistingUploadedFile: boolean) {
  return z
    .object({
      source: z.enum(['DEFAULT_TEMPLATE', 'UPLOADED']),
      file: z.any().optional(),
      startDate: z.string().min(1, 'Start date is required'),
      supervisionMonths: z
        .number({ error: 'Must be a number' })
        .int('Must be a whole number of months')
        .min(1, 'Must be at least 1 month')
        .max(60, 'Must be 60 months or less'),
      monthlyAmount: z.number({ error: 'Must be a number' }).min(0, 'Must be 0 or greater'),
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

function buildDefaultValues(hire: HireListItem): SendAgreementFormValues {
  const agreement = hire.agreement
  return {
    source: agreement?.source ?? 'DEFAULT_TEMPLATE',
    file: undefined,
    startDate: toDateInputValue(agreement?.startDate ?? hire.startDate ?? hire.preferredStartDate),
    supervisionMonths: agreement?.supervisionMonths ?? hire.supervisionMonths ?? 6,
    monthlyAmount: agreement
      ? Number(agreement.monthlyAmount)
      : hire.monthlyAmount != null
        ? Number(hire.monthlyAmount)
        : 0,
    signatureName: '',
    consent: false,
  }
}

const SOURCE_OPTIONS: { value: AgreementSource; label: string; description: string }[] = [
  {
    value: 'DEFAULT_TEMPLATE',
    label: 'Use the default agreement',
    description: "The platform's standard supervision agreement, applied with your terms below.",
  },
  {
    value: 'UPLOADED',
    label: 'Upload my own',
    description: 'Use your own agreement document (PDF, JPG, or PNG).',
  },
]

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
  const hasExistingUploadedFile =
    hire.agreement?.source === 'UPLOADED' && hire.agreement.fileUrl != null

  const schema = useMemo(
    () => buildSendAgreementSchema(hasExistingUploadedFile),
    [hasExistingUploadedFile],
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
    const termsValid = await form.trigger(['startDate', 'supervisionMonths', 'monthlyAmount'])
    if (!termsValid) return
    const values = form.getValues()
    setPreviewLoading(true)
    try {
      const blob = await previewAgreement(hire.id, {
        startDate: values.startDate,
        supervisionMonths: values.supervisionMonths,
        monthlyAmount: values.monthlyAmount,
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
      supervisionMonths: values.supervisionMonths,
      monthlyAmount: values.monthlyAmount,
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
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
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
                          {SOURCE_OPTIONS.map((opt) => (
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
                  isSubmitting={isSubmitting}
                  rules={{ required: 'Start date is required' }}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInputField
                    control={form.control}
                    name="supervisionMonths"
                    label="Number of Months Needed"
                    required
                    type="number"
                    numberValue
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
                    min={0}
                    step={1}
                    isSubmitting={isSubmitting}
                    placeholder="e.g. 400"
                    rules={{ required: 'Monthly amount is required' }}
                    startAdornment={<span className="text-muted-foreground">$</span>}
                  />
                </div>
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
                  <Button type="submit" disabled={isSubmitting}>
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
        <DialogContent className="flex h-[85vh] max-w-3xl flex-col">
          <DialogTitle>Agreement Preview</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            This is exactly what {superviseeName} will receive.
          </p>
          {previewUrl && (
            /* Fragment fits the whole page on open (Chrome: view=Fit, Firefox: zoom=page-fit)
               so older users see the full document without fiddling with zoom. */
            <iframe
              src={`${previewUrl}#view=Fit&zoom=page-fit`}
              title="Agreement preview"
              className="mt-3 min-h-0 w-full flex-1 rounded-md border bg-muted/30"
            />
          )}
        </DialogContent>
      </DialogRoot>
    </>
  )
}
