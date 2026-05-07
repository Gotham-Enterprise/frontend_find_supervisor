/**
 * Maps empty strings and NaN (from `input[type=number]` `valueAsNumber`) to `undefined`
 * so Zod can show friendly errors instead of "expected number, received NaN".
 */
export function normalizeNumberFieldInput(val: unknown): unknown {
  if (val === '' || val === null || val === undefined) return undefined
  if (typeof val === 'number' && Number.isNaN(val)) return undefined
  return val
}
