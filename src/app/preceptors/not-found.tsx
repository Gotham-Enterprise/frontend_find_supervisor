import { NotFoundContent } from '@/components/NotFoundContent'

export const metadata = {
  title: 'Page Not Found',
}

/**
 * 404 boundary for the /preceptors pSEO pages — invalid state slugs and
 * unknown profiles land here via notFound(), keeping the segment's
 * header/footer and offering a way back to the Preceptor browse.
 */
export default function PreceptorsNotFound() {
  // The /preceptors layout already renders the full PublicHeader, so the
  // content is embedded (standalone would duplicate the header).
  return (
    <NotFoundContent
      secondaryLink={{ href: '/preceptors', label: 'Browse Preceptors' }}
      standalone={false}
    />
  )
}
