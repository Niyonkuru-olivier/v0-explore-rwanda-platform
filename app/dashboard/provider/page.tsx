import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProviderDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    // Profile doesn't exist, redirect to login
    redirect("/auth/login")
  }

  if (profile.role !== "provider") {
    // If admin, redirect to admin dashboard; otherwise redirect home
    if (profile.role === "admin") {
      redirect("/dashboard/admin")
    } else {
      redirect("/")
    }
  }

  // Router: redirect based on provider_type
  if (!profile.provider_type) {
    // If no provider_type set, redirect to account settings to set it
    // This should not happen for existing providers, but handle gracefully
    redirect("/dashboard/account")
  }

  // Map provider_type to dashboard URLs (in the order specified)
  const providerTypeMap: Record<string, string> = {
    car_rental: "/dashboard/provider/car-rental",
    hotel: "/dashboard/provider/hotel",
    restaurant: "/dashboard/provider/restaurant",
    tour_guide: "/dashboard/provider/tour-guide",
    transport: "/dashboard/provider/transport",
  }

  const redirectPath = providerTypeMap[profile.provider_type]

  if (redirectPath) {
    redirect(redirectPath)
  } else {
    // Unknown provider_type, redirect home
    redirect("/")
  }
}

