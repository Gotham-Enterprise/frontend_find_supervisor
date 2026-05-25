import type { ApiResponse, LoginCredentials, User } from '@/types'

import { apiClient } from './client'

interface LoginResponse {
  success: boolean
  isAuthenticated: boolean
  data: User
  token: string
  refreshToken: string
}

export interface TermsAndPrivacyPolicyResponse {
  data: {
    privacy: { content: string }
    terms: { content: string }
  }
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const { data } = await apiClient.post<LoginResponse>('/supervision/login', credentials)
  return data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/supervision/me')
  return data.data
}

export async function getTermsAndPrivacyPolicy(): Promise<TermsAndPrivacyPolicyResponse> {
  const { data } = await apiClient.get<TermsAndPrivacyPolicyResponse>('/auth/terms/privacy/all')
  return data
}
