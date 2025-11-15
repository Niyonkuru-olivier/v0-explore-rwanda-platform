"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveHotel(hotelId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  const { error } = await supabase.from("hotels").update({ status: "approved" }).eq("id", hotelId)

  if (error) {
    throw error
  }

  revalidatePath("/admin/hotels")
  revalidatePath("/hotels")
}

export async function rejectHotel(hotelId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  const { error } = await supabase.from("hotels").update({ status: "rejected" }).eq("id", hotelId)

  if (error) {
    throw error
  }

  revalidatePath("/admin/hotels")
}

