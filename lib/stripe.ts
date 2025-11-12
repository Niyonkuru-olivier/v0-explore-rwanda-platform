import "server-only"

import Stripe from "stripe"

// Lazy initialization function to prevent build-time errors
// This ensures Stripe is only initialized when actually needed at runtime
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) {
    return stripeInstance
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return null
  }

  try {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2024-11-20.acacia",
    })
    return stripeInstance
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
    return null
  }
}
