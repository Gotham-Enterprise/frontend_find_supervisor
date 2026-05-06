import type { HireStatus, PreferredAvailability, PreferredFormat } from '@/types/hire'

/** Supervisee snapshot included with GET /supervision/supervisors/past-clients hire rows. */
export interface PastClientSupervisee {
  id: string
  fullName: string | null
  email: string
  profilePhotoUrl: string | null
  city: string | null
  state: string | null
  occupation: { id: number; name: string } | null
  specialty: { id: number; name: string } | null
}

/** One hire row returned by GET /supervision/supervisors/past-clients (completed / reviewed). */
export interface PastClientHire {
  id: string
  supervisorId: string
  superviseeId: string
  status: HireStatus

  startDate: string | null
  endDate: string | null
  completedAt: string | null

  preferredFormat: PreferredFormat | null
  preferredAvailability: PreferredAvailability | null
  goals: string | null
  notes: string | null

  supervisee: PastClientSupervisee

  createdAt: string
  updatedAt: string
}
