import { NotFoundContent } from '@/components/NotFoundContent'

export const metadata = {
  title: 'Page Not Found',
}

/**
 * 404 boundary for the /supervisors pSEO pages — invalid state/license slugs
 * (e.g. /supervisors/zz) land here via notFound(), so this variant also offers
 * the Browse Supervisors by State link.
 */
export default function SupervisorsNotFound() {
  // The /supervisors layout already renders the full PublicHeader, so the
  // content is embedded (standalone would duplicate the header).
  return (
    <NotFoundContent
      secondaryLink={{ href: '/supervisors', label: 'Browse Supervisors by State' }}
      standalone={false}
    />
  )
}
