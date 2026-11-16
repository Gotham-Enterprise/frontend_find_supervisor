'use client'

import { useEffect, useState } from 'react'

/**
 * Object URLs (thumbnails) for picked image files, one per file in order,
 * `null` for non-images. Created and revoked inside one effect so a revoked
 * URL is never left in use: StrictMode runs mount → cleanup → mount in dev,
 * which breaks the usual useMemo + revoke-on-cleanup pairing.
 */
export function useObjectUrls(files: File[], isImage: (type: string) => boolean) {
  const [urls, setUrls] = useState<(string | null)[]>([])
  useEffect(() => {
    const next = files.map((file) => (isImage(file.type) ? URL.createObjectURL(file) : null))
    // Blob URLs are an external resource that must be recreated after every
    // cleanup, so the state write has to live in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrls(next)
    return () => next.forEach((url) => url && URL.revokeObjectURL(url))
  }, [files, isImage])
  return urls
}
