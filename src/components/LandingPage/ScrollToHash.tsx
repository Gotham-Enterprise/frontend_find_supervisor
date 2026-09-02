'use client'

import { useEffect } from 'react'

/**
 * Scrolls to the URL hash target after the landing page content is on the page.
 * The public route streams in behind a loading boundary, so the browser's
 * native anchor scroll fires while only the loading fallback is in the DOM and
 * silently does nothing — retry until the target exists, then scroll once.
 */
export function ScrollToHash() {
  useEffect(() => {
    // Matches the pre-paint guard in the root layout, which hides the body
    // while this hash scroll is pending so the top of the page never flashes.
    const reveal = () => document.documentElement.removeAttribute('data-hash-scroll-pending')

    let hash = ''
    try {
      hash = decodeURIComponent(window.location.hash.slice(1))
    } catch {
      reveal()
      return
    }
    if (!hash) {
      reveal()
      return
    }

    let cancelled = false
    const startedAt = performance.now()

    function attempt() {
      if (cancelled) return
      const el = document.getElementById(hash)
      if (el) {
        // Only correct when the section isn't already positioned (the browser's
        // native anchor scroll may have handled it), then reveal the page.
        const top = el.getBoundingClientRect().top
        if (top < 0 || top > 150) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' })
        }
        reveal()
        return
      }
      if (performance.now() - startedAt < 5000) {
        requestAnimationFrame(attempt)
      } else {
        reveal()
      }
    }
    attempt()

    return () => {
      cancelled = true
      reveal()
    }
  }, [])

  return null
}
