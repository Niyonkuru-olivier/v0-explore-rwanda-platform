"use server"

import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createCheckoutSession(
  bookingType: "hotel" | "tour" | "attraction",
  referenceId: string,
  checkInDate?: string,
  checkOutDate?: string,
  numberOfGuests?: number,
  specialRequests?: string,
) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the item details
  let item: any
  let tableName = ""
  let priceInCents = 0
  let productName = ""
  let productDescription = ""

  if (bookingType === "hotel") {
    tableName = "hotels"
    const { data } = await supabase.from("hotels").select("*").eq("id", referenceId).single()
    item = data

    if (!item) throw new Error("Hotel not found")
    
    // Ensure hotel is approved before allowing booking
    if (item.status !== "approved") {
      throw new Error("This hotel is not available for booking. Please contact support if you believe this is an error.")
    }

    const nights =
      checkInDate && checkOutDate
        ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
        : 1

    priceInCents = item.price_per_night_rwf * nights
    productName = item.name
    productDescription = `${nights} night(s) stay for ${numberOfGuests || 1} guest(s)`
  } else if (bookingType === "tour") {
    tableName = "tours"
    const { data } = await supabase.from("tours").select("*").eq("id", referenceId).single()
    item = data

    if (!item) throw new Error("Tour not found")
    
    // Ensure tour is approved before allowing booking
    if (item.status !== "approved") {
      throw new Error("This tour is not available for booking. Please contact support if you believe this is an error.")
    }

    priceInCents = item.price_per_person_rwf * (numberOfGuests || 1)
    productName = item.name
    productDescription = `${item.duration_days} day tour for ${numberOfGuests || 1} guest(s)`
  } else if (bookingType === "attraction") {
    tableName = "attractions"
    const { data } = await supabase.from("attractions").select("*").eq("id", referenceId).single()
    item = data

    if (!item) throw new Error("Attraction not found")

    priceInCents = item.entry_fee_rwf * (numberOfGuests || 1)
    productName = item.name
    productDescription = `Entry for ${numberOfGuests || 1} guest(s)`
  }

  // Create booking record
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      booking_type: bookingType,
      reference_id: referenceId,
      check_in_date: checkInDate || null,
      check_out_date: checkOutDate || null,
      number_of_guests: numberOfGuests || 1,
      total_amount_rwf: priceInCents,
      payment_status: "pending",
      booking_status: "pending",
      special_requests: specialRequests || null,
    })
    .select()
    .single()

  if (bookingError) throw bookingError

  // Get Stripe instance (lazy initialization)
  const stripe = getStripe()
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price_data: {
          currency: "rwf",
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    metadata: {
      booking_id: booking.id,
      user_id: user.id,
    },
  })

  // Update booking with Stripe session ID
  await supabase.from("bookings").update({ stripe_session_id: session.id }).eq("id", booking.id)

  return session.client_secret
}

export async function getBookingStatus(bookingId: string) {
  const supabase = await createClient()

  const { data: booking } = await supabase.from("bookings").select("*").eq("id", bookingId).single()

  if (!booking) return null

  // If we have a Stripe session, check its status
  if (booking.stripe_session_id) {
    const stripe = getStripe()
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id)

      if (session.payment_status === "paid" && booking.payment_status !== "completed") {
        // Update booking status
        await supabase
          .from("bookings")
          .update({
            payment_status: "completed",
            booking_status: "confirmed",
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq("id", bookingId)

        return { ...booking, payment_status: "completed", booking_status: "confirmed" }
      }
    }
  }

  return booking
}
