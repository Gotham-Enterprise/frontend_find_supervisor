/** Normalize API/user role strings for comparison (handles `SUPERVISEE` and `supervisee`). */
export function isSuperviseeRole(role: string | null | undefined): boolean {
  return role?.toUpperCase() === 'SUPERVISEE'
}

/** Normalize API/user role strings for comparison (handles `SUPERVISOR` and `supervisor`). */
export function isSupervisorRole(role: string | null | undefined): boolean {
  return role?.toUpperCase() === 'SUPERVISOR'
}

/**
 * Home after login for supervisors and supervisees (same route; dashboard picks supervisor vs supervisee UI).
 * Unknown roles use the same entry to match dashboard fallback behavior.
 */
export function getDashboardPathForRole(role: string | null | undefined): string {
  switch (role?.toUpperCase()) {
    case 'SUPERVISOR':
    case 'SUPERVISEE':
    case 'ADMIN':
    default:
      return '/dashboard'
  }
}
