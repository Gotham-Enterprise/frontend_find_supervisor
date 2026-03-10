import type { ApiResponse, AuthToken, LoginCredentials, User } from '@/types'

import { apiClient } from './client'

export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const { data } = await apiClient.post<ApiResponse<AuthToken>>('/auth/login', credentials)
  return data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/auth/me')
  return data.data
}
