import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProviderPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "provider") {
    if (profile?.role === "admin") {
      redirect("/dashboard/admin")
    } else {
    redirect("/")
    }
  }

  // Redirect to the new dashboard router which will route to the correct provider dashboard
  redirect("/dashboard/provider")
}
