"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
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

  return supabase
}

// Hotels
export async function approveHotel(hotelId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("hotels").update({ status: "approved" }).eq("id", hotelId)
  if (error) throw error
  revalidatePath("/admin/hotels")
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

export async function rejectHotel(hotelId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("hotels").update({ status: "rejected" }).eq("id", hotelId)
  if (error) throw error
  revalidatePath("/admin/hotels")
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

// Tours
export async function approveTour(tourId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("tours").update({ status: "approved" }).eq("id", tourId)
  if (error) throw error
  revalidatePath("/admin/tours")
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

export async function rejectTour(tourId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("tours").update({ status: "rejected" }).eq("id", tourId)
  if (error) throw error
  revalidatePath("/admin/tours")
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

// Restaurants
export async function approveRestaurant(restaurantId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("restaurants").update({ status: "approved" }).eq("id", restaurantId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

export async function rejectRestaurant(restaurantId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("restaurants").update({ status: "rejected" }).eq("id", restaurantId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

// Car Rentals
export async function approveCarRental(carRentalId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("car_rentals").update({ status: "approved" }).eq("id", carRentalId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

export async function rejectCarRental(carRentalId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("car_rentals").update({ status: "rejected" }).eq("id", carRentalId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

// Transport Services
export async function approveTransportService(transportId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("transport_services").update({ status: "approved" }).eq("id", transportId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

export async function rejectTransportService(transportId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("transport_services").update({ status: "rejected" }).eq("id", transportId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

// Attractions (no approval needed, but keeping for consistency)
export async function approveAttraction(attractionId: string) {
  const supabase = await checkAdmin()
  // Attractions don't have status, but we can add featured flag
  const { error } = await supabase.from("attractions").update({ featured: true }).eq("id", attractionId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

export async function rejectAttraction(attractionId: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from("attractions").update({ featured: false }).eq("id", attractionId)
  if (error) throw error
  revalidatePath("/dashboard/admin")
  revalidatePath("/")
}

