/**
 * Routes that redirect to the dashboard when a session already exists (landing `/`, login, signup).
 * Other public marketing URLs stay reachable when logged in unless listed here.
 */
export const GUEST_ONLY_PATHS = ['/', '/login', '/signup'] as const

export type GuestOnlyPath = (typeof GUEST_ONLY_PATHS)[number]

export function isGuestOnlyPath(pathname: string): boolean {
  return (GUEST_ONLY_PATHS as readonly string[]).includes(pathname)
}
