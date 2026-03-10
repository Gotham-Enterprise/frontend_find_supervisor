import axios from 'axios'

export const TOKEN_KEY = 'auth_token'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof window !== 'undefined' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)
