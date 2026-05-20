import axios from 'axios'

export const TOKEN_KEY = 'auth_token'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'

/** Legacy login stored the string `'true'` before JWT bearer auth. */
function isLegacySessionFlag(value: string): boolean {
  return value === 'true'
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token || isLegacySessionFlag(token)) return null
  return token
}

export function setStoredAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/** Paths where we already handle unauthenticated users — do not assign /login again (avoids reload loops). */
const AUTH_ENTRY_PATH_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-email',
  '/forgot-password',
  '/reset-password',
  '/email-verification',
] as const

function isAuthEntryPath(pathname: string): boolean {
  return AUTH_ENTRY_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Bearer token in Authorization header is the primary auth path for cross-origin (e.g. Amplify).
  withCredentials: false,
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof window !== 'undefined' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.includes('/supervision/login') &&
      !error.config?.url?.includes('/supervision/forgot-email')
    ) {
      clearStoredAuthToken()
      if (!isAuthEntryPath(window.location.pathname)) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)
