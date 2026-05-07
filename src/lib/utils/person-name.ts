/**
 * Title-cases each whitespace-separated token while preserving spacing (common pattern for
 * full-name fields). Applies as the user types.
 *
 * @example "john DOE" → "John Doe"
 */
export function capitalizePersonNameWords(value: string): string {
  return value.replace(/\S+/g, (word) => {
    if (!word) return word
    const first = word.charAt(0).toLocaleUpperCase()
    const rest = word.slice(1).toLocaleLowerCase()
    return first + rest
  })
}
