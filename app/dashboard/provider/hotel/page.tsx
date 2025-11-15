import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Hotel, Plus, Eye, Edit, TrendingUp } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function HotelOwnerDashboardPage() {
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

  // Verify provider_type matches
  if (profile.provider_type !== "hotel") {
    redirect("/dashboard/provider")
  }

  // Fetch provider's hotels
  const { data: hotels } = await supabase
    .from("hotels")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  // Get booking statistics
  const hotelIds = hotels?.map((h) => h.id) || []

  const { data: hotelBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_type", "hotel")
    .in("reference_id", hotelIds)

  const totalBookings = hotelBookings?.length || 0
  const totalRevenue = hotelBookings?.reduce((sum, b) => sum + b.total_amount_rwf, 0) || 0
  const pendingHotels = hotels?.filter((h) => h.status === "pending").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Hotel className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-blue-900">Hotel Owner Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-600">Hotel Owner</Badge>
                <span className="text-gray-600">•</span>
                <p className="text-gray-600">{profile.full_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hotels</p>
                  <p className="text-3xl font-bold text-blue-600">{hotels?.length || 0}</p>
                </div>
                <Hotel className="h-10 w-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hotel Bookings</p>
                  <p className="text-3xl font-bold text-emerald-600">{totalBookings}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Hotels</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingHotels}</p>
                </div>
                <Hotel className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hotel Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    minimumFractionDigits: 0,
                  }).format(totalRevenue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotels List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-blue-900">My Hotels</CardTitle>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/provider/hotels/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Hotel
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {hotels && hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                      <p className="text-sm text-gray-600">{hotel.location}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={
                            hotel.status === "approved"
                              ? "default"
                              : hotel.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            hotel.status === "approved"
                              ? "bg-emerald-600"
                              : hotel.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }
                        >
                          {hotel.status}
                        </Badge>
                        <Badge variant="outline">
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            minimumFractionDigits: 0,
                          }).format(hotel.price_per_night_rwf)}
                          /night
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/hotels/${hotel.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/provider/hotels/${hotel.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hotels yet. Add your first hotel to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

