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
