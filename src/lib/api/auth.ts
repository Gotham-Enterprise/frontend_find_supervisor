import type { ApiResponse, LoginCredentials, User } from '@/types'

import { apiClient } from './client'

interface LoginResponse {
  success: boolean
  isAuthenticated: boolean
  data: User
  token: string
  refreshToken: string
}

export interface LoginResult {
  user: User
  token: string
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResponse>('/supervision/login', credentials)
  return { user: data.data, token: data.token }
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/supervision/me')
  return data.data
}
