/** Where to send the user after successful verification when no role is returned */
export function getPostVerificationFallbackPath(): string {
  return process.env.NEXT_PUBLIC_POST_VERIFY_REDIRECT ?? '/login?verified=1'
}

export const AUTO_REDIRECT_MS = 2800
