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

/** A calendar date (YYYY-MM-DD) as UTC midnight, so formatting never shifts it a day. */
function calendarDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`)
}

/** "2026-10-12" → "Mon, Oct 12" (a calendar date; no timezone shift). */
export function formatCalendarDate(isoDate: string): string {
  return calendarDate(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** "Oct 12–18" or "Oct 26 – Nov 1" for a Monday–Sunday billing week. */
export function formatWeekRange(startDate: string, endDate: string): string {
  const month = (d: string) =>
    calendarDate(d).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  const day = (d: string) => Number(d.slice(8, 10))
  return month(startDate) === month(endDate)
    ? `${month(startDate)} ${day(startDate)}–${day(endDate)}`
    : `${month(startDate)} ${day(startDate)} – ${month(endDate)} ${day(endDate)}`
}

/** The US Eastern calendar day of an instant: "Mon, Oct 12". */
export function formatEasternDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  })
}

/** An instant in US Eastern time: "Thu, Oct 22, 11:59 PM ET". */
export function formatEasternDateTime(iso: string): string {
  const formatted = new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  })
  return `${formatted} ET`
}

/** 45 → "45 min", 60 → "1 h", 90 → "1 h 30 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
