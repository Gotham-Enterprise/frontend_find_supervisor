export interface VerificationPageData {
  fullName: string
  email: string
  role: string
  /** The activationToken returned at signup, used for the resend endpoint. */
  token?: string
}
