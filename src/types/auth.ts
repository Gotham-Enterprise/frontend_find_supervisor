export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthToken {
  accessToken: string
  expiresAt: string
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
}
