import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import AccountSettingsForm from "@/components/dashboard/account-settings-form"

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role")
    .eq("id", user.id)
    .single()

  let profile = profileData

  if (!profile) {
    const metadata = user.user_metadata ?? {}
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? "",
        full_name: metadata.full_name ?? "",
        phone: metadata.phone ?? null,
        role: metadata.role ?? "tourist",
      })
      .select("id, full_name, email, phone, role")
      .single()

    if (createError) {
      throw createError
    }

    profile = newProfile
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900">My Account</h1>
          <p className="text-gray-600">Review and update your personal details.</p>
        </div>
        <AccountSettingsForm
          initialData={{
            id: profile.id,
            fullName: profile?.full_name ?? "",
            email: profile?.email ?? user.email ?? "",
            phone: profile?.phone ?? "",
            role: profile?.role ?? "tourist",
          }}
        />
      </div>
    </div>
  )
}

