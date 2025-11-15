import { NextResponse } from "next/server"
import { z } from "zod"

import { supabaseAdminClient } from "@/lib/supabase/admin"

const VALID_PROVIDER_TYPES = ["hotel", "tour_guide", "car_rental", "restaurant", "transport"] as const

const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  phone: z.string().min(3).max(30).optional().or(z.literal("")),
  role: z.enum(["tourist", "provider"]),
  providerType: z
    .union([
      z.enum(VALID_PROVIDER_TYPES, {
        errorMap: () => ({
          message: `Provider type must be one of: ${VALID_PROVIDER_TYPES.join(", ")}`,
        }),
      }),
      z.literal(""),
      z.null(),
    ])
    .optional(),
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

  // Normalize providerType: convert empty string to null, ensure it's trimmed
  const normalizedProviderType = providerType && providerType.trim() ? providerType.trim() : null

  if (role === "provider" && !normalizedProviderType) {
    return NextResponse.json({ error: "Please select a provider type" }, { status: 400 })
  }

  // Additional validation: ensure providerType is valid if role is provider
  if (role === "provider" && normalizedProviderType) {
    // Type guard to check if normalizedProviderType is a valid provider type
    const isValidProviderType = (type: string): type is typeof VALID_PROVIDER_TYPES[number] => {
      return VALID_PROVIDER_TYPES.includes(type as typeof VALID_PROVIDER_TYPES[number])
    }
    
    if (!isValidProviderType(normalizedProviderType)) {
      return NextResponse.json(
        { error: `Invalid provider type. Must be one of: ${VALID_PROVIDER_TYPES.join(", ")}` },
        { status: 400 }
      )
    }
  }

  let createdUserId: string | undefined

  try {
    // Create user using admin API with custom metadata
    const { data: createUserData, error: createUserError } = await supabaseAdminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
        role,
        provider_type: role === "provider" ? normalizedProviderType : null,
      },
    })

    if (createUserError) {
      if (createUserError.message?.includes("already registered")) {
        return NextResponse.json({ error: "This email address is already registered." }, { status: 409 })
      }
      throw createUserError
    }

    createdUserId = createUserData.user?.id

    if (!createdUserId) {
      throw new Error("User was created but user ID is missing")
    }

    if (process.env.NODE_ENV === "development") {
      console.log("User created successfully (no email verification):", {
        userId: createdUserId,
        email,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (createdUserId) {
      await supabaseAdminClient.auth.admin.deleteUser(createdUserId).catch(() => undefined)
    }

    // Enhanced error logging for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    // Log error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("Registration error:", {
        message: errorMessage,
        stack: errorStack,
        role,
        providerType: normalizedProviderType || providerType,
        email,
        createdUserId,
      })
    }

    // Return user-friendly error message
    let userMessage = "Unable to complete registration. Please try again later."
    
    // Check for specific error types
    if (errorMessage.includes("constraint") || errorMessage.includes("check constraint")) {
      userMessage = "Invalid provider type selected. Please try again with a valid service type."
    } else if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
      userMessage = "This email address is already registered."
    } else if (errorMessage.includes("generateLink") || errorMessage.includes("verification link")) {
      userMessage = "We created your account but couldn't send the verification email. Please contact support or try logging in."
    } else if (errorMessage.includes("RESEND_API_KEY") || errorMessage.includes("verification email")) {
      // Email sending failed but account was created - this is handled gracefully above
      userMessage = "Account created successfully! Verification email couldn't be sent. Please check the console for the verification link or contact support."
    } else if (errorMessage) {
      // Use the error message if it's user-friendly, but sanitize technical details
      userMessage = errorMessage.replace(/generateLink error:|with user ID error:/gi, "").trim()
    }

    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}

