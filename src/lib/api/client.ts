import axios from 'axios'

export const TOKEN_KEY = 'auth_token'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'

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
  // Required so the browser sends the httpOnly auth cookie with every request
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof window !== 'undefined' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.includes('/supervision/login')
    ) {
      localStorage.removeItem(TOKEN_KEY)
      if (!isAuthEntryPath(window.location.pathname)) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)
