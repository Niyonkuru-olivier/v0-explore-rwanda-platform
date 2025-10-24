import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Hotel, Compass, Car, Utensils, Truck, Plus, Eye, Edit, TrendingUp } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ProviderDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || !["provider", "admin"].includes(profile.role)) {
    redirect("/")
  }

  // Fetch provider's hotels
  const { data: hotels } = await supabase
    .from("hotels")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch provider's tours
  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  // Get booking statistics
  const hotelIds = hotels?.map((h) => h.id) || []
  const tourIds = tours?.map((t) => t.id) || []

  const { data: hotelBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_type", "hotel")
    .in("reference_id", hotelIds)

  const { data: tourBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_type", "tour")
    .in("reference_id", tourIds)

  const totalBookings = (hotelBookings?.length || 0) + (tourBookings?.length || 0)
  const totalRevenue =
    (hotelBookings?.reduce((sum, b) => sum + b.total_amount_rwf, 0) || 0) +
    (tourBookings?.reduce((sum, b) => sum + b.total_amount_rwf, 0) || 0)

  const getProviderIcon = () => {
    switch (profile.provider_type) {
      case "hotel":
        return <Hotel className="h-8 w-8" />
      case "tour_guide":
        return <Compass className="h-8 w-8" />
      case "car_rental":
        return <Car className="h-8 w-8" />
      case "restaurant":
        return <Utensils className="h-8 w-8" />
      case "transport":
        return <Truck className="h-8 w-8" />
      default:
        return <Hotel className="h-8 w-8" />
    }
  }

  const getProviderLabel = () => {
    switch (profile.provider_type) {
      case "hotel":
        return "Hotel Owner"
      case "tour_guide":
        return "Tour Guide"
      case "car_rental":
        return "Car Rental Service"
      case "restaurant":
        return "Restaurant Owner"
      case "transport":
        return "Transport Service"
      default:
        return "Service Provider"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">{getProviderIcon()}</div>
            <div>
              <h1 className="text-4xl font-bold text-blue-900">Provider Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-600">{getProviderLabel()}</Badge>
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
                  <p className="text-sm text-gray-600 mb-1">Total Tours</p>
                  <p className="text-3xl font-bold text-amber-600">{tours?.length || 0}</p>
                </div>
                <Compass className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-emerald-600">{totalBookings}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
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

        {/* Hotels Section */}
        {(profile.provider_type === "hotel" || !profile.provider_type) && (
          <Card className="mb-8">
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
        )}

        {/* Tours Section */}
        {(profile.provider_type === "tour_guide" || !profile.provider_type) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl text-amber-900">My Tours</CardTitle>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/provider/tours/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tour
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tours && tours.length > 0 ? (
                <div className="space-y-4">
                  {tours.map((tour) => (
                    <div
                      key={tour.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{tour.name}</h3>
                        <p className="text-sm text-gray-600">
                          {tour.duration_days} days • Max {tour.max_participants} participants
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge
                            variant={
                              tour.status === "approved"
                                ? "default"
                                : tour.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              tour.status === "approved"
                                ? "bg-emerald-600"
                                : tour.status === "pending"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }
                          >
                            {tour.status}
                          </Badge>
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(tour.price_per_person_rwf)}
                            /person
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tours/${tour.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/provider/tours/${tour.id}/edit`}>
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
                  <p>No tours yet. Add your first tour to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {profile.provider_type === "car_rental" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
                <Car className="h-6 w-6" />
                Car Rental Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Car rental management coming soon!</p>
                <p className="text-sm text-gray-400">
                  You'll be able to list your vehicles, manage bookings, and track rentals.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.provider_type === "restaurant" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
                <Utensils className="h-6 w-6" />
                Restaurant Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Restaurant management coming soon!</p>
                <p className="text-sm text-gray-400">
                  You'll be able to manage your menu, reservations, and customer reviews.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.provider_type === "transport" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-900 flex items-center gap-2">
                <Truck className="h-6 w-6" />
                Transport Service Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Transport service management coming soon!</p>
                <p className="text-sm text-gray-400">
                  You'll be able to manage routes, schedules, and transportation bookings.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
