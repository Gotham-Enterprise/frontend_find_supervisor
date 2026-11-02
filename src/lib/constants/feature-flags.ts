/**
 * In-app supervisee → supervisor payments (Stripe Connect payouts, weekly hire
 * billing). Ships dark until the backend flag SUPERVISION_IN_APP_PAYMENTS_ENABLED
 * is also on; set NEXT_PUBLIC_IN_APP_PAYMENTS_ENABLED=true to show the UI.
 */
export const IN_APP_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_IN_APP_PAYMENTS_ENABLED === 'true'

/**
 * In-app MONTHLY billing for Medical Director retainers (charged each month,
 * released to the Medical Director after the month ends). Needs the flag above
 * and the backend's SUPERVISION_IN_APP_MONTHLY_ENABLED; while off, monthly
 * agreements stay paid outside the app.
 */
export const IN_APP_MONTHLY_ENABLED =
  IN_APP_PAYMENTS_ENABLED && process.env.NEXT_PUBLIC_IN_APP_MONTHLY_ENABLED === 'true'
