'use client'

import { FileSignature, FileText } from 'lucide-react'

import { AgreementBody } from '@/components/HiredSupervisors/AgreementDialog'
import { HireRequestDetailsBody } from '@/components/HiredSupervisors/HireRequestDetailsDialog'
import { cardLabel } from '@/components/HirePayment/HirePaymentSetup'
import { Button } from '@/components/ui/button'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { useHirePayment } from '@/lib/hooks'
import type { HireListItem } from '@/types/hire'

/**
 * Upwork's "Contract details": the agreement (terms, document, signatures,
 * weekly payment and card) and the original request with its timeline.
 * Signing still happens in the agreement dialog.
 */
export function WorkroomDetails({
  hire,
  supervisorName,
  canSignAgreement,
  onSign,
  onSetUpPayment,
}: {
  hire: HireListItem
  supervisorName: string
  canSignAgreement: boolean
  onSign: () => void
  onSetUpPayment: (options?: { changeCard?: boolean }) => void
}) {
  const agreement = hire.agreement
  const hourly = agreement?.hourlyRateCents != null && agreement.weeklyCapMinutes != null
  const { data: paymentInfo } = useHirePayment(hire.id, IN_APP_PAYMENTS_ENABLED && hourly)

  // Before an agreement exists there's nothing to show but where it stands.
  const noAgreementNote =
    hire.status === 'ACCEPTED' || hire.status === 'ACTIVE'
      ? `${supervisorName} accepted your request and will send the supervision agreement here.`
      : hire.status === 'PENDING' || hire.status === 'REVIEWED'
        ? `Once ${supervisorName} accepts your request, they'll send the supervision agreement here.`
        : 'There is no agreement for this request.'

  return (
    <div className="space-y-6">
      {agreement ? (
        <section className="rounded-xl border bg-card px-6 py-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Supervision Agreement</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Version {agreement.version} ·{' '}
                {agreement.source === 'UPLOADED'
                  ? 'Uploaded by supervisor'
                  : 'Platform default template'}
              </p>
            </div>
            {canSignAgreement && (
              <Button size="sm" className="shrink-0" onClick={onSign}>
                <FileSignature className="size-3.5" aria-hidden />
                Review &amp; Sign
              </Button>
            )}
          </div>
          <AgreementBody
            hire={hire}
            hasSavedCards={(paymentInfo?.savedCards.length ?? 0) > 0}
            cardLabelText={paymentInfo?.card ? cardLabel(paymentInfo.card) : null}
            onSetUpPayment={IN_APP_PAYMENTS_ENABLED ? onSetUpPayment : undefined}
          />
        </section>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border bg-card px-6 py-4">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">No agreement yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{noAgreementNote}</p>
          </div>
        </div>
      )}

      <section className="rounded-xl border bg-card px-6 py-5">
        <h2 className="mb-4 text-base font-semibold text-foreground">Request Details</h2>
        {/* The status is already in the header. */}
        <HireRequestDetailsBody hire={hire} showStatus={false} wide />
      </section>
    </div>
  )
}
