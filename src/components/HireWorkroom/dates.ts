/**
 * Calendar math on YYYY-MM-DD strings (US Eastern calendar dates, as the
 * billing weeks use). Done in UTC so no local timezone shifts a day.
 */

function utc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`)
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** "2026-10-26" + 3 → "2026-10-29" */
export function addDays(isoDate: string, days: number): string {
  const d = utc(isoDate)
  d.setUTCDate(d.getUTCDate() + days)
  return iso(d)
}

/** The Monday of the Monday–Sunday week containing the date. */
export function mondayOf(isoDate: string): string {
  const weekday = (utc(isoDate).getUTCDay() + 6) % 7 // Mon = 0 … Sun = 6
  return addDays(isoDate, -weekday)
}

/** "2026-10-14" → "2026-10" */
export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

/** "2026-10" + 1 → "2026-11" */
export function addMonths(month: string, months: number): string {
  const d = utc(`${month}-01`)
  d.setUTCMonth(d.getUTCMonth() + months)
  return iso(d).slice(0, 7)
}

/** "2026-10" → "October 2026" */
export function formatMonth(month: string): string {
  return utc(`${month}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Monday-first weeks (7 dates each) covering the whole month, padded with the neighbours' days. */
export function monthGrid(month: string): string[][] {
  const first = `${month}-01`
  let day = mondayOf(first)
  const weeks: string[][] = []
  do {
    const week = Array.from({ length: 7 }, (_, i) => addDays(day, i))
    weeks.push(week)
    day = addDays(day, 7)
  } while (monthOf(day) === month)
  return weeks
}

/** "2026-10-26" → "26 Monday" (the timesheet's day rows) */
export function formatDayRow(isoDate: string): string {
  const weekday = utc(isoDate).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  return `${Number(isoDate.slice(8, 10))} ${weekday}`
}

/** 75 → "1:15 hrs" (the timesheet's hours format) */
export function formatHrs(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')} hrs`
}
