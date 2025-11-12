import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Heart, Clock, CreditCard, User } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function TouristDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If profile doesn't exist, create one with default tourist role
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || "",
        role: user.user_metadata?.role || "tourist",
        phone: user.user_metadata?.phone || null,
      })
      .select("*")
      .single()
    profile = newProfile
  }

  // Redirect based on role if not tourist
  if (profile && profile.role !== "tourist") {
    if (profile.role === "admin") {
      redirect("/dashboard/admin")
    } else if (profile.role === "provider") {
      redirect("/dashboard/provider")
    } else {
      redirect("/")
    }
  }

  // If still no profile, redirect to home
  if (!profile) {
    redirect("/")
  }

  // Fetch user's bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const upcomingBookings = bookings?.filter((b) => b.booking_status === "confirmed") || []
  const completedBookings = bookings?.filter((b) => b.booking_status === "completed") || []
  const totalSpent = bookings?.reduce((sum, b) => sum + b.total_amount_rwf, 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Welcome back, {profile.full_name || "Explorer"}!</h1>
          <p className="text-gray-600">Your Rwanda adventure dashboard</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-emerald-600">{bookings?.length || 0}</p>
                </div>
                <Calendar className="h-10 w-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Trips</p>
                  <p className="text-3xl font-bold text-blue-600">{upcomingBookings.length}</p>
                </div>
                <MapPin className="h-10 w-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-amber-600">{completedBookings.length}</p>
                </div>
                <Heart className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    minimumFractionDigits: 0,
                  }).format(totalSpent)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-900">Explore Attractions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Discover Rwanda's natural wonders and wildlife</p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/attractions">Browse Attractions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">Book Hotels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Find comfortable accommodations across Rwanda</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/hotels">Browse Hotels</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900">Join Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Experience guided tours with local experts</p>
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link href="/tours">Browse Tours</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-gray-900">My Bookings</CardTitle>
            <Button asChild variant="outline">
              <Link href="/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg capitalize">{booking.booking_type}</h3>
                        <Badge
                          variant={
                            booking.booking_status === "confirmed"
                              ? "default"
                              : booking.booking_status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            booking.booking_status === "confirmed"
                              ? "bg-emerald-600"
                              : booking.booking_status === "completed"
                                ? "bg-blue-600"
                                : ""
                          }
                        >
                          {booking.booking_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {booking.number_of_guests} guest(s)
                        </span>
                        {booking.check_in_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.check_in_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 mb-1">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(booking.total_amount_rwf)}
                      </p>
                      <Badge
                        variant={booking.payment_status === "completed" ? "default" : "secondary"}
                        className={booking.payment_status === "completed" ? "bg-green-600" : "bg-amber-500"}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No bookings yet. Start exploring Rwanda!</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/attractions">Start Exploring</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
