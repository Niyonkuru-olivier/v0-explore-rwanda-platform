import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Hotel, Compass, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminStats } from "@/components/dashboard/admin-stats"

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
  const { data: restaurants } = await supabase.from("restaurants").select("id, status")
  const { data: transportServices } = await supabase.from("transport_services").select("id, status")
  const { data: carRentals } = await supabase.from("car_rentals").select("id, status")

  const totalUsers = users?.length || 0
  const totalProviders = users?.filter((u) => u.role === "provider").length || 0
  const hotelProviders = users?.filter((u) => u.provider_type === "hotel").length || 0
  const tourGuides = users?.filter((u) => u.provider_type === "tour_guide").length || 0
  const carRentalProviders = users?.filter((u) => u.provider_type === "car_rental").length || 0

  const totalHotels = hotels?.length || 0
  const pendingHotels = hotels?.filter((h) => h.status === "pending").length || 0
  const totalTours = tours?.length || 0
  const pendingTours = tours?.filter((t) => t.status === "pending").length || 0
  const totalAttractions = attractions?.length || 0
  const totalRestaurants = restaurants?.length || 0
  const totalTransportServices = transportServices?.length || 0
  const totalCarRentals = carRentals?.length || 0

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

        {/* Statistics Grid - Clickable Cards */}
        <AdminStats
          totalUsers={totalUsers}
          totalHotels={totalHotels}
          totalTours={totalTours}
          totalAttractions={totalAttractions}
          totalRestaurants={totalRestaurants}
          totalTransportServices={totalTransportServices}
          totalCarRentals={totalCarRentals}
        />

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
                    <p className="text-2xl font-bold text-emerald-600">{carRentalProviders}</p>
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

      </div>
    </div>
  )
}
