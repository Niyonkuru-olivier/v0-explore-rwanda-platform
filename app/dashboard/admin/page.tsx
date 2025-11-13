import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Hotel, Compass, Mountain, DollarSign, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  // Fetch statistics
  const { data: users } = await supabase.from("profiles").select("id, role, provider_type")
  const { data: hotels } = await supabase.from("hotels").select("id, status")
  const { data: tours } = await supabase.from("tours").select("id, status")
  const { data: attractions } = await supabase.from("attractions").select("id")
  const { data: bookings } = await supabase.from("bookings").select("*")

  const totalUsers = users?.length || 0
  const totalProviders = users?.filter((u) => u.role === "provider").length || 0
  const hotelProviders = users?.filter((u) => u.provider_type === "hotel").length || 0
  const tourGuides = users?.filter((u) => u.provider_type === "tour_guide").length || 0
  const carRentals = users?.filter((u) => u.provider_type === "car_rental").length || 0

  const totalHotels = hotels?.length || 0
  const pendingHotels = hotels?.filter((h) => h.status === "pending").length || 0
  const totalTours = tours?.length || 0
  const pendingTours = tours?.filter((t) => t.status === "pending").length || 0
  const totalAttractions = attractions?.length || 0
  const totalBookings = bookings?.length || 0
  const totalRevenue = bookings?.reduce((sum, b) => sum + b.total_amount_rwf, 0) || 0
  const completedBookings = bookings?.filter((b) => b.payment_status === "completed").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gray-900 rounded-lg text-white">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage the entire Explore Rwanda platform</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium text-gray-900">{profile?.full_name || user.email}</span>
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">{totalProviders} providers</p>
                </div>
                <Users className="h-10 w-10 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hotels</p>
                  <p className="text-3xl font-bold text-blue-600">{totalHotels}</p>
                  <p className="text-xs text-amber-600 mt-1">{pendingHotels} pending approval</p>
                </div>
                <Hotel className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tours</p>
                  <p className="text-3xl font-bold text-amber-600">{totalTours}</p>
                  <p className="text-xs text-amber-600 mt-1">{pendingTours} pending approval</p>
                </div>
                <Compass className="h-10 w-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attractions</p>
                  <p className="text-3xl font-bold text-emerald-600">{totalAttractions}</p>
                </div>
                <Mountain className="h-10 w-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-purple-600">{totalBookings}</p>
                  <p className="text-xs text-emerald-600 mt-1">{completedBookings} completed</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-4xl font-bold text-green-600">
                    {new Intl.NumberFormat("en-RW", {
                      style: "currency",
                      currency: "RWF",
                      minimumFractionDigits: 0,
                    }).format(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Provider Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hotel Owners</p>
                    <p className="text-2xl font-bold text-blue-600">{hotelProviders}</p>
                  </div>
                  <Hotel className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tour Guides</p>
                    <p className="text-2xl font-bold text-amber-600">{tourGuides}</p>
                  </div>
                  <Compass className="h-8 w-8 text-amber-400" />
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Car Rentals</p>
                    <p className="text-2xl font-bold text-emerald-600">{carRentals}</p>
                  </div>
                  <Users className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">Manage Hotels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Review and approve hotel listings from providers</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/admin/hotels">Manage Hotels</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900">Manage Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Review and approve tour packages from providers</p>
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link href="/admin/tours">Manage Tours</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-900">Manage Attractions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Add and manage Rwanda's tourist attractions</p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/admin/attractions">Manage Attractions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold capitalize">{booking.booking_type}</p>
                      <p className="text-sm text-gray-600">
                        {booking.number_of_guests} guest(s) • {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(booking.total_amount_rwf)}
                      </p>
                      <Badge
                        variant={booking.payment_status === "completed" ? "default" : "secondary"}
                        className={booking.payment_status === "completed" ? "bg-emerald-600" : "bg-amber-500"}
                      >
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No bookings yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
