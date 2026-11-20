import { loadStripe } from '@stripe/stripe-js'

// Stripe publishable key — safe to expose in client code.
// loadStripe is called lazily so the module can load even when the key is absent.
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

/** Shared Stripe.js instance; null when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. */
export const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null
