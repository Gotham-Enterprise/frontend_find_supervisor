export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthToken {
  accessToken: string
  expiresAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'supervisor' | 'supervisee'
  createdAt: string
}
