/**
 * True when the value is a same-origin path ("/foo…") — guards `?redirect=`
 * params against open redirects ("https://evil.com", "//evil.com").
 */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//')
}
