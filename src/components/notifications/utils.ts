/**
 * Returns a human-readable relative time string for a past date.
 * Suitable for notification timestamps.
 */
export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export type NotificationNavigationTarget =
  | { kind: 'internal'; pathname: string }
  | { kind: 'external'; href: string }

/**
 * Turn backend `redirectSlug` values into a client navigation target.
 * API routes often use a `/supervision/...` prefix; this app serves the dashboard under `/`.
 */
export function resolveNotificationRedirect(slug: string): NotificationNavigationTarget {
  const s = slug.trim()
  if (!s) return { kind: 'internal', pathname: '/' }
  if (/^https?:\/\//i.test(s)) return { kind: 'external', href: s }
  const path = s.startsWith('/') ? s : `/${s}`
  const pathname = path.replace(/^\/supervision(?=\/)/, '')
  return { kind: 'internal', pathname }
}
