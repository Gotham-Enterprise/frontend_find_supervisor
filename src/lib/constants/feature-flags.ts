/**
 * In-app supervisee → supervisor payments (Stripe Connect payouts, weekly hire
 * billing). Ships dark until the backend flag SUPERVISION_IN_APP_PAYMENTS_ENABLED
 * is also on; set NEXT_PUBLIC_IN_APP_PAYMENTS_ENABLED=true to show the UI.
 */
export const IN_APP_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_IN_APP_PAYMENTS_ENABLED === 'true'
