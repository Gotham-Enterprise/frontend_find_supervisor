import { Badge } from '@/components/ui/badge'
import {
  getAgreementBadgeClassName,
  getAgreementStage,
  getAgreementStageLabel,
} from '@/lib/utils/supervision-status'
import type { HireListItem } from '@/types/hire'

/**
 * Secondary badge showing where the hire stands in the agreement flow.
 * Only rendered while the agreement is actionable (ACCEPTED/ACTIVE hires).
 */
export function AgreementStageBadge({ hire }: { hire: HireListItem }) {
  if (hire.status !== 'ACCEPTED' && hire.status !== 'ACTIVE') return null

  const stage = getAgreementStage(hire)
  return (
    <Badge variant="outline" className={getAgreementBadgeClassName(stage)}>
      {getAgreementStageLabel(stage)}
    </Badge>
  )
}
