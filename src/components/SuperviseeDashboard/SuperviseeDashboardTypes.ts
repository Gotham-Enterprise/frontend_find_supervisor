export type GoalStatus = 'done' | 'current' | 'upcoming'

export interface GoalStep {
  label: string
  description: string
  status: GoalStatus
  /** Where the "Start →" link goes when this step is the current one. */
  ctaHref?: string
}
