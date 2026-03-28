export type GoalStatus = 'done' | 'current' | 'upcoming'

export interface GoalStep {
  label: string
  description: string
  status: GoalStatus
}
