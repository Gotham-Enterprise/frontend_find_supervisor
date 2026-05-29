'use client'

import type { ReactNode } from 'react'

import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useStatesOptions, useSuperviseeFormOptions } from '@/lib/hooks'
import {
  formatAvailability,
  formatBudgetRange,
  formatDate,
  formatDisplayName,
  formatFeeAmount,
  formatLookingInStatesLabel,
  formatSupervisionFormat,
  formatSupervisionHours,
  resolveSupervisorTypeLabel,
} from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'

import { HireStatusBadge } from './HireStatusBadge'

const UNSPECIFIED = 'Not specified'

function displayText(value: string | null | undefined, formatted?: string): string {
  const v = (formatted ?? value ?? '').trim()
  if (!v || v === 'N/A' || v === '—') return UNSPECIFIED
  return v
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return UNSPECIFIED
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return UNSPECIFIED
  }
}

function isSpecified(value: string): boolean {
  return value.trim() !== UNSPECIFIED && value.trim() !== ''
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-sm text-foreground ${multiline ? 'whitespace-pre-wrap break-words' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

function FieldList({
  fields,
}: {
  fields: Array<{ label: string; value: string; multiline?: boolean }>
}) {
  const visible = fields.filter((f) => isSpecified(f.value))
  if (visible.length === 0) return null
  return (
    <div className="space-y-3">
      {visible.map((f) => (
        <Field key={f.label} label={f.label} value={f.value} multiline={f.multiline} />
      ))}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}

interface HireRequestDetailsDialogProps {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HireRequestDetailsDialog({
  hire,
  open,
  onOpenChange,
}: HireRequestDetailsDialogProps) {
  const { supervisorTypes } = useSuperviseeFormOptions()
  const { data: stateOptions = [] } = useStatesOptions()
  const supervisorTypeOptions = supervisorTypes.data ?? []
  const supervisorName = formatDisplayName(hire.supervisor)
  const licenseStates =
    hire.supervisorStateLicense?.length > 0 ? hire.supervisorStateLicense.join(', ') : UNSPECIFIED

  const requestedFields = [
    {
      label: 'Preferred format',
      value: displayText(hire.preferredFormat, formatSupervisionFormat(hire.preferredFormat)),
    },
    {
      label: 'Preferred availability',
      value: displayText(
        hire.preferredAvailability,
        formatAvailability(hire.preferredAvailability),
      ),
    },
    {
      label: 'Type of supervisor needed',
      value: displayText(
        null,
        resolveSupervisorTypeLabel(hire.typeOfSupervisorNeeded, supervisorTypeOptions),
      ),
    },
    {
      label: 'State they are looking in',
      value: displayText(
        null,
        formatLookingInStatesLabel(hire.stateTheyAreLookingIn, stateOptions),
      ),
    },
    {
      label: 'Preferred start date',
      value: displayText(hire.preferredStartDate, formatDate(hire.preferredStartDate)),
    },
    ...(hire.supervisionHours != null
      ? [
          {
            label: 'Supervision hours needed',
            value: displayText(null, formatSupervisionHours(hire.supervisionHours)),
          },
        ]
      : []),
    {
      label: 'Budget range',
      value: displayText(
        null,
        formatBudgetRange(hire.budgetRangeStart, hire.budgetRangeEnd, hire.budgetRangeType),
      ),
    },
    { label: 'Intro message', value: displayText(hire.introMessage), multiline: true },
    { label: 'Goals', value: displayText(hire.goals), multiline: true },
  ]

  const snapshotFields = [
    { label: 'Profession', value: displayText(hire.supervisorProfession) },
    { label: 'License type', value: displayText(hire.supervisorLicenseType) },
    { label: 'State license', value: licenseStates },
    {
      label: 'Format',
      value: displayText(hire.supervisorFormat, formatSupervisionFormat(hire.supervisorFormat)),
    },
    {
      label: 'Availability',
      value: displayText(
        hire.supervisorAvailability,
        formatAvailability(hire.supervisorAvailability),
      ),
    },
    {
      label: 'Fee',
      value: displayText(null, formatFeeAmount(hire.supervisorFeeAmount, hire.supervisorFeeType)),
    },
  ]

  const agreementFields = [
    { label: 'Submitted', value: formatDateTime(hire.createdAt) },
    { label: 'Last updated', value: formatDateTime(hire.updatedAt) },
    { label: 'Accepted at', value: formatDateTime(hire.acceptedAt) },
    { label: 'Agreed at', value: formatDateTime(hire.agreedAt) },
    { label: 'Supervision start', value: displayText(hire.startDate, formatDate(hire.startDate)) },
    { label: 'Supervision end', value: displayText(hire.endDate, formatDate(hire.endDate)) },
    {
      label: 'Planned duration (months)',
      value: hire.supervisionMonths != null ? String(hire.supervisionMonths) : UNSPECIFIED,
    },
    {
      label: 'Monthly amount',
      value: displayText(hire.monthlyAmount, hire.monthlyAmount ?? undefined),
    },
    {
      label: 'Transaction fee',
      value: displayText(hire.transactionFeePct, hire.transactionFeePct ?? undefined),
    },
    { label: 'Completed at', value: formatDateTime(hire.completedAt) },
    { label: 'Canceled at', value: formatDateTime(hire.canceledAt) },
    { label: 'Rejected at', value: formatDateTime(hire.rejectedAt) },
    ...(hire.status === 'REJECTED'
      ? [
          {
            label: 'Rejection reason',
            value: displayText(hire.rejectionReason),
            multiline: true as const,
          },
        ]
      : []),
    { label: 'Notes', value: displayText(hire.notes), multiline: true },
  ]

  const hasRequested = requestedFields.some((f) => isSpecified(f.value))
  const hasSnapshot = snapshotFields.some((f) => isSpecified(f.value))
  const hasAgreement = agreementFields.some((f) => isSpecified(f.value))

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(85vh,780px)] max-w-2xl overflow-y-auto p-0 sm:max-w-2xl">
        <div className="border-b border-border px-6 pb-4 pr-12 pt-6">
          <DialogTitle className="pr-10 text-lg">Request details</DialogTitle>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Full information for this hire request
          </p>
          <p className="mt-3 text-sm font-medium text-foreground">{supervisorName}</p>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <HireStatusBadge status={hire.status} completedAt={hire.completedAt} />
          </div>

          {hasRequested && (
            <div>
              <SectionTitle>What you requested</SectionTitle>
              <div className="mt-3">
                <FieldList fields={requestedFields} />
              </div>
            </div>
          )}

          {hasRequested && hasSnapshot && <Separator />}

          {hasSnapshot && (
            <div>
              <SectionTitle>Supervisor snapshot (at request)</SectionTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Captured when you submitted this request; may differ from the supervisor’s current
                profile.
              </p>
              <div className="mt-3">
                <FieldList fields={snapshotFields} />
              </div>
            </div>
          )}

          {(hasRequested || hasSnapshot) && hasAgreement && <Separator />}

          {hasAgreement && (
            <div>
              <SectionTitle>Agreement & timeline</SectionTitle>
              <div className="mt-3">
                <FieldList fields={agreementFields} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
