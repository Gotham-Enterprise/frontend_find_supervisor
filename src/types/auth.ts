export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthToken {
  accessToken: string
  expiresAt: string
}

/** Permission flags returned by GET /supervision/me → data.permissions */
export interface UserPermissions {
  /** Whether the supervisee can see a supervisor's contact details (phone, email). */
  isSupervisorContactDetailsVisible: boolean
  /** Whether the supervisee is allowed to send a hire request. */
  canHireSupervisor: boolean
  /** Whether the supervisor is allowed to accept incoming hire requests. */
  canAcceptRequest: boolean
}

// Matches the SupervisionUser shape returned by the backend
export interface User {
  id: string
  email: string
  /** Backend returns fullName; name is kept for compatibility */
  name: string
  fullName?: string | null
  role: 'SUPERVISOR' | 'SUPERVISEE' | 'ADMIN' | 'supervisor' | 'supervisee' | 'admin'
  createdAt: string
  profilePhotoUrl?: string | null
  city?: string | null
  state?: string | null
  emailVerified?: boolean
  status?: string
  permissions?: UserPermissions | null
}
