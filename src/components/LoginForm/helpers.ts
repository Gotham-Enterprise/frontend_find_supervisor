import { z } from 'zod'

export const REMEMBERED_LOGIN_EMAIL_KEY = 'find_supervisor_login_email'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const loginFormDefaultValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
}
