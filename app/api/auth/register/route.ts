import { NextResponse } from "next/server"
import { z } from "zod"

import { supabaseAdminClient } from "@/lib/supabase/admin"
import { sendVerificationEmail } from "@/lib/email/send"

const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  phone: z.string().min(3).max(30).optional().or(z.literal("")),
  role: z.enum(["tourist", "provider"]),
  providerType: z.string().max(60).optional().or(z.literal("")),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid registration payload" },
      { status: 400 },
    )
  }

  const { email, password, fullName, phone, role, providerType } = parsed.data

  if (role === "provider" && !providerType) {
    return NextResponse.json({ error: "Please select a provider type" }, { status: 400 })
  }

  const siteUrlString =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  if (!siteUrlString) {
    return NextResponse.json(
      { error: "Site URL is not configured. Set NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL." },
      { status: 500 },
    )
  }

  const siteUrl = new URL(siteUrlString)

  let createdUserId: string | undefined

  try {
    const { data: createUserData, error: createUserError } = await supabaseAdminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
        role,
        provider_type: role === "provider" ? providerType : null,
      },
    })

    if (createUserError) {
      if (createUserError.message?.includes("already registered")) {
        return NextResponse.json({ error: "This email address is already registered." }, { status: 409 })
      }
      throw createUserError
    }

    createdUserId = createUserData.user?.id

    const { data: linkData, error: linkError } = await supabaseAdminClient.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: new URL("/auth/login?verified=1", siteUrl).toString(),
      },
    })

    if (linkError || !linkData?.action_link) {
      throw linkError ?? new Error("Failed to generate verification link")
    }

    await sendVerificationEmail({
      to: email,
      fullName,
      actionLink: linkData.action_link,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (createdUserId) {
      await supabaseAdminClient.auth.admin.deleteUser(createdUserId).catch(() => undefined)
    }

    const message =
      error instanceof Error ? error.message : "Unable to complete registration. Please try again later."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

