import { NotFoundContent } from '@/components/NotFoundContent'

export const metadata = {
  title: 'Page Not Found',
}

/**
 * Branded 404 for every unmatched route in the app. The HTTP status stays 404 —
 * only the page is styled — so search engines still treat these URLs as
 * non-existent. /supervisors/* has its own boundary with a browse link.
 */
export default function NotFound() {
  return <NotFoundContent />
}
