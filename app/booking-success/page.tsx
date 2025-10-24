import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getBookingStatus } from "@/app/actions/stripe"
import { ReceiptPrint } from "@/components/receipt-print"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; booking_id?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (!params.booking_id) {
    notFound()
  }

  const booking = await getBookingStatus(params.booking_id)

  if (!booking) {
    notFound()
  }

  let itemDetails: any = null
  if (booking.booking_type === "hotel") {
    const { data } = await supabase.from("hotels").select("*").eq("id", booking.reference_id).single()
    itemDetails = data
  } else if (booking.booking_type === "tour") {
    const { data } = await supabase.from("tours").select("*").eq("id", booking.reference_id).single()
    itemDetails = data
  } else if (booking.booking_type === "attraction") {
    const { data } = await supabase.from("attractions").select("*").eq("id", booking.reference_id).single()
    itemDetails = data
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your payment was successful. Check your email for confirmation.</p>
        </div>

        <ReceiptPrint
          bookingId={booking.id}
          bookingType={booking.booking_type}
          itemName={itemDetails?.name || "N/A"}
          customerName={profile?.full_name || "N/A"}
          customerEmail={profile?.email || "N/A"}
          totalAmount={booking.total_amount_rwf}
          bookingDate={booking.created_at}
          checkInDate={booking.check_in_date}
          checkOutDate={booking.check_out_date}
          guests={booking.number_of_guests}
          specialRequests={booking.special_requests}
        />

        <Card className="border-emerald-200 mb-6">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-2xl text-emerald-900">Booking Receipt</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Booking Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono">{booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Type:</span>
                  <span className="capitalize font-medium">{booking.booking_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-emerald-600 font-medium capitalize">{booking.booking_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="text-emerald-600 font-medium capitalize">{booking.payment_status}</span>
                </div>
              </div>
            </div>

            {itemDetails && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">{itemDetails.name}</h3>
                <div className="space-y-2 text-sm">
                  {booking.booking_type === "hotel" && (
                    <>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Check-in: {new Date(booking.check_in_date!).toLocaleDateString()} | Check-out:{" "}
                          {new Date(booking.check_out_date!).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{booking.number_of_guests} guest(s)</span>
                      </div>
                    </>
                  )}
                  {booking.booking_type === "tour" && (
                    <>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Start Date: {new Date(booking.check_in_date!).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{booking.number_of_guests} participant(s)</span>
                      </div>
                    </>
                  )}
                  {booking.booking_type === "attraction" && (
                    <>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Visit Date: {new Date(booking.check_in_date!).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{booking.number_of_guests} visitor(s)</span>
                      </div>
                    </>
                  )}
                  {itemDetails.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{itemDetails.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{profile?.full_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {booking.special_requests && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-2">Special Requests</h3>
                <p className="text-sm text-gray-600">{booking.special_requests}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount Paid:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    minimumFractionDigits: 0,
                  }).format(booking.total_amount_rwf)}
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 border-t pt-4">
              Booked on {new Date(booking.created_at).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" size="lg" asChild>
            <Link href="/bookings">
              <Calendar className="mr-2 h-5 w-5" />
              View All Bookings
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" size="lg" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
