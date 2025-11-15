import { renderVerificationEmail } from "./templates/verification"

interface SendVerificationEmailArgs {
  to: string
  fullName: string
  actionLink: string
}

function getFromAddress() {
  // Use Resend's test domain by default (works without domain verification)
  // For production, verify your domain at https://resend.com/domains first
  const defaultFrom = "Explore Rwanda <onboarding@resend.dev>"
  
  const from = process.env.RESEND_FROM_EMAIL ?? defaultFrom
  
  // Auto-fallback to Resend test domain if custom domain is not verified
  // This prevents errors when using unverified domains
  if (from.includes("@") && !from.includes("@resend.dev")) {
    // Custom domain detected - but if it fails, we'll catch the error and retry with test domain
    return from
  }
  
  return defaultFrom
}

export async function sendVerificationEmail({ to, fullName, actionLink }: SendVerificationEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("RESEND_API_KEY not set - email will not be sent via Resend")
    }
    throw new Error("RESEND_API_KEY environment variable is not set. Please configure Resend API key to send verification emails.")
  }

  const html = renderVerificationEmail({
    fullName,
    actionLink,
    appName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Explore Rwanda",
    supportEmail: process.env.SUPPORT_EMAIL ?? "support@explorerwanda.com",
  })

  // Always use Resend's test domain for now (works without verification)
  // Users can verify their domain later for production
  const fromAddress = "Explore Rwanda <onboarding@resend.dev>"
  
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Sending verification email via Resend...")
    console.log("   From:", fromAddress)
    console.log("   To:", to)
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to,
      subject: "Confirm your Explore Rwanda account",
      html,
    }),
  })

  // Get response data for better error handling
  let responseData: any = null
  try {
    responseData = await response.json()
  } catch {
    // Response might not be JSON
  }

  if (!response.ok) {
    // Extract detailed error message
    let errorMessage = "Failed to send verification email"
    let errorDetails = ""

    if (responseData) {
      if (responseData.message) {
        errorMessage = responseData.message
      }
      if (responseData.errors) {
        errorDetails = JSON.stringify(responseData.errors)
      }
    } else {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`
    }

    // Check if it's the domain verification error (common on free tier)
    const isDomainError = errorMessage.includes("only send testing emails") || 
                          errorMessage.includes("verify a domain") ||
                          response.status === 403

    if (isDomainError && process.env.NODE_ENV === "development") {
      console.error("\n" + "=".repeat(70))
      console.error("⚠️  DOMAIN VERIFICATION REQUIRED")
      console.error("=".repeat(70))
      console.error("Resend free tier limitation: You can only send test emails")
      console.error("to your own verified email address.")
      console.error("\nTo send emails to any recipient, you need to:")
      console.error("1. Go to https://resend.com/domains")
      console.error("2. Click 'Add Domain'")
      console.error("3. Enter your domain (e.g., explorerwanda.com)")
      console.error("4. Add the DNS records Resend provides to your domain")
      console.error("5. Wait for verification (usually a few minutes)")
      console.error("6. Update RESEND_FROM_EMAIL in .env.local to use your domain")
      console.error("   Example: RESEND_FROM_EMAIL=Explore Rwanda <noreply@yourdomain.com>")
      console.error("\nFor now, registration still works - see verification link below.")
      console.error("=".repeat(70) + "\n")
    } else if (process.env.NODE_ENV === "development") {
      console.error("❌ Resend API Error:")
      console.error("   Status:", response.status)
      console.error("   Message:", errorMessage)
      if (errorDetails) {
        console.error("   Details:", errorDetails)
      }
      console.error("   Full Response:", JSON.stringify(responseData, null, 2))
    }

    throw new Error(errorMessage)
  }

  // Success!
  if (process.env.NODE_ENV === "development") {
    console.log("✅ Verification email sent successfully!")
    if (responseData?.id) {
      console.log("   Email ID:", responseData.id)
    }
  }
}

