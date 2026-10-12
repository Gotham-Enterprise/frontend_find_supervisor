/** Formats a Date as YYYY-MM-DD using its *local* calendar date. */
export function toLocalISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Today's local calendar date as YYYY-MM-DD.
 *
 * Use this (not `new Date().toISOString()` or `new Date('YYYY-MM-DD')` comparisons)
 * when working with `<input type="date">` values: toISOString() is the UTC date and
 * `new Date('YYYY-MM-DD')` parses as UTC midnight, both off by one day in timezones
 * behind UTC for part of the day. ISO date strings compare correctly as strings.
 */
export function todayLocalISO(): string {
  return toLocalISODate(new Date())
}

/**
 * Calendar date in US Eastern time as YYYY-MM-DD. In-app billing (billing
 * weeks, deadlines, the earliest agreement start date) runs on US Eastern,
 * matching the backend, whatever the viewer's own timezone.
 */
export function toEasternISODate(date: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
