import { z } from 'zod'

export const forgotEmailSchema = z
  .object({
    phone: z.string().min(1, 'Phone number is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ForgotEmailFormValues = z.infer<typeof forgotEmailSchema>

export const forgotEmailFormDefaultValues: ForgotEmailFormValues = {
  phone: '',
  newPassword: '',
  confirmPassword: '',
}
