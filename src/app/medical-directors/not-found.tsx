import { NotFoundContent } from '@/components/NotFoundContent'

export const metadata = {
  title: 'Page Not Found',
}

/**
 * 404 boundary for the /medical-directors pSEO pages — invalid state slugs and
 * unknown profiles land here via notFound(), keeping the segment's
 * header/footer and offering a way back to the Medical Director browse.
 */
export default function MedicalDirectorsNotFound() {
  // The /medical-directors layout already renders the full PublicHeader, so
  // the content is embedded (standalone would duplicate the header).
  return (
    <NotFoundContent
      secondaryLink={{ href: '/medical-directors', label: 'Browse Medical Directors' }}
      standalone={false}
    />
  )
}
