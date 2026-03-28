import { redirect } from 'next/navigation'

/** Old public URL; search now lives at `/supervisors` (authenticated supervisees only). */
export default function SearchSupervisorsLegacyRedirect() {
  redirect('/supervisors')
}
