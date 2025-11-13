import { renderVerificationEmail } from "./templates/verification"

interface SendVerificationEmailArgs {
  to: string
  fullName: string
  actionLink: string
}

function getFromAddress() {
  const from = process.env.RESEND_FROM_EMAIL ?? "Explore Rwanda <no-reply@explorerwanda.com>"
  if (!from.includes("<") || !from.includes(">")) {
    return from
  }

  return from
}

export async function sendVerificationEmail({ to, fullName, actionLink }: SendVerificationEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set")
  }

  const html = renderVerificationEmail({
    fullName,
    actionLink,
    appName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Explore Rwanda",
    supportEmail: process.env.SUPPORT_EMAIL ?? "support@explorerwanda.com",
  })

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to,
      subject: "Confirm your Explore Rwanda account",
      html,
    }),
  })

  if (!response.ok) {
    let message = "Failed to send verification email"

    try {
      const errorPayload = await response.json()
      if (errorPayload?.message) {
        message = errorPayload.message
      }
    } catch {
      // ignore parsing errors
    }

    throw new Error(message)
  }
}

