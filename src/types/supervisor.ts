export interface Supervisor {
  id: string
  name: string
  email: string
  department: string
  specializations: string[]
  maxSupervisees: number
  currentSuperviseeCount: number
  available: boolean
  createdAt: string
}
