/** Normalize API/user role strings for comparison (handles `SUPERVISEE` and `supervisee`). */
export function isSuperviseeRole(role: string | null | undefined): boolean {
  return role?.toUpperCase() === 'SUPERVISEE'
}
