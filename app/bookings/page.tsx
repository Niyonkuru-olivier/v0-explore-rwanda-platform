import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function BookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch related items for each booking
  const bookingsWithDetails = await Promise.all(
    (bookings || []).map(async (booking) => {
      let itemDetails = null
      if (booking.booking_type === "hotel") {
        const { data } = await supabase
          .from("hotels")
          .select("name, location, images")
          .eq("id", booking.reference_id)
          .single()
        itemDetails = data
      } else if (booking.booking_type === "tour") {
        const { data } = await supabase
          .from("tours")
          .select("name, duration_days, images")
          .eq("id", booking.reference_id)
          .single()
        itemDetails = data
      } else if (booking.booking_type === "attraction") {
        const { data } = await supabase
          .from("attractions")
          .select("name, location, images")
          .eq("id", booking.reference_id)
          .single()
        itemDetails = data
      }
      return { ...booking, itemDetails }
    }),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Bookings</h1>

        {bookingsWithDetails.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
              <Button asChild>
                <Link href="/">Start Exploring</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookingsWithDetails.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-emerald-900">
                        {booking.itemDetails?.name || "Booking"}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{booking.booking_type}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge
                        variant={booking.payment_status === "completed" ? "default" : "secondary"}
                        className={
                          booking.payment_status === "completed"
                            ? "bg-emerald-600"
                            : booking.payment_status === "pending"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }
                      >
                        {booking.payment_status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {booking.booking_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      {booking.check_in_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {booking.booking_type === "hotel"
                              ? `${new Date(booking.check_in_date).toLocaleDateString()} - ${new Date(booking.check_out_date!).toLocaleDateString()}`
                              : new Date(booking.check_in_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{booking.number_of_guests} guest(s)</span>
                      </div>
                      {booking.itemDetails?.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.itemDetails.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(booking.total_amount_rwf)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Booked on {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm font-semibold mb-1">Special Requests:</p>
                      <p className="text-sm text-gray-600">{booking.special_requests}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/booking-success?booking_id=${booking.id}`}>View Receipt</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
