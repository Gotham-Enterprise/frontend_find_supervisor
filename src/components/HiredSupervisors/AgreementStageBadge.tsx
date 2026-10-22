import { Badge } from '@/components/ui/badge'
import {
  getAgreementBadgeClassName,
  getAgreementStage,
  getAgreementStageLabel,
} from '@/lib/utils/supervision-status'
import type { HireListItem } from '@/types/hire'

/**
 * Secondary badge showing where the hire stands in the agreement flow.
 * Only rendered on ACCEPTED hires: an ACTIVE hire always has a signed agreement
 * (monthly ones turn active on signing, hourly ones once the first prepay is
 * paid), so the badge would just repeat it. An accepted hire can still be
 * signed — an hourly one whose start date or first prepay is still ahead.
 */
export function AgreementStageBadge({ hire }: { hire: HireListItem }) {
  if (hire.status !== 'ACCEPTED') return null

  const stage = getAgreementStage(hire)
  return (
    <Badge variant="outline" className={getAgreementBadgeClassName(stage)}>
      {getAgreementStageLabel(stage)}
    </Badge>
  )
}
