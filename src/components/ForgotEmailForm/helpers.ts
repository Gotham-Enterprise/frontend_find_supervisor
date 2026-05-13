import { z } from 'zod'

export const forgotEmailSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
  recoveryEmail: z
    .string()
    .min(1, 'Recovery email is required')
    .email('Please enter a valid email address'),
})

export type ForgotEmailFormValues = z.infer<typeof forgotEmailSchema>

export const forgotEmailFormDefaultValues: ForgotEmailFormValues = {
  phone: '',
  password: '',
  recoveryEmail: '',
}
