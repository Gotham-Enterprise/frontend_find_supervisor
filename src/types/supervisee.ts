export interface Supervisee {
  id: string
  name: string
  email: string
  department: string
  program: string
  year: number
  supervisorId: string | null
  createdAt: string
}
