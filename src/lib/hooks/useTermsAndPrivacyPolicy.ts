import { useQuery } from '@tanstack/react-query'

import { getTermsAndPrivacyPolicy } from '@/lib/api/auth'

export const termsAndPrivacyKeys = {
  all: ['terms-and-privacy-policy'] as const,
}

export function useTermsAndPrivacyPolicy() {
  return useQuery({
    queryKey: termsAndPrivacyKeys.all,
    queryFn: getTermsAndPrivacyPolicy,
    staleTime: 1000 * 60 * 60, // 1 hour — legal content changes rarely
  })
}
