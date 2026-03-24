/** Duration of the resend cooldown in milliseconds (3 minutes). */
export const COOLDOWN_DURATION_MS = 3 * 60 * 1000

function storageKey(token: string): string {
  return `resend_cooldown_expiry_${token}`
}

/**
 * Saves a cooldown expiry timestamp to localStorage for the given token.
 * Call this immediately after a successful resend.
 */
export function saveCooldownExpiry(token: string): void {
  if (typeof window === 'undefined') return
  const expiry = Date.now() + COOLDOWN_DURATION_MS
  localStorage.setItem(storageKey(token), String(expiry))
}

/**
 * Returns remaining cooldown in milliseconds, or 0 if the cooldown has passed / not set.
 * Safe to call on both server and client.
 */
export function getRemainingCooldown(token: string): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(storageKey(token))
  if (!stored) return 0
  const expiry = parseInt(stored, 10)
  if (isNaN(expiry)) return 0
  const remaining = expiry - Date.now()
  return remaining > 0 ? remaining : 0
}

/**
 * Clears the stored cooldown for the given token.
 */
export function clearCooldown(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(token))
}

/**
 * Formats a remaining millisecond value as `M:SS` (e.g. `2:59`).
 */
export function formatCooldownCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
