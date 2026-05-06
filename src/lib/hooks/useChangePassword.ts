import { useMutation } from '@tanstack/react-query'

import { changePassword } from '@/lib/api/supervision'

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  })
}
