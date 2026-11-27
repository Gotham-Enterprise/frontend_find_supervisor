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
 * (both monthly and hourly ones turn active on signing), so the badge would
 * just repeat it.
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
