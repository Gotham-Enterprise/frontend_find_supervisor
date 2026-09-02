import { NotFoundContent } from '@/components/NotFoundContent'

export const metadata = {
  title: 'Page Not Found',
}

/**
 * 404 boundary for the /browse-supervisees pSEO pages — invalid state slugs
 * land here via notFound(), keeping the segment's header/footer and offering
 * a way back to the supervisee browse.
 */
export default function BrowseSuperviseesNotFound() {
  // The /browse-supervisees layout already renders the full PublicHeader, so
  // the content is embedded (standalone would duplicate the header).
  return (
    <NotFoundContent
      secondaryLink={{ href: '/browse-supervisees', label: 'Browse Supervisees' }}
      standalone={false}
    />
  )
}
