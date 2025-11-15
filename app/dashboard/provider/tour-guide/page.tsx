import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Compass, Plus, Eye, Edit, TrendingUp } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function TourGuideDashboardPage() {
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
  if (profile.provider_type !== "tour_guide") {
    redirect("/dashboard/provider")
  }

  // Fetch provider's tours
  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  // Get booking statistics
  const tourIds = tours?.map((t) => t.id) || []

  const { data: tourBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_type", "tour")
    .in("reference_id", tourIds)

  const totalBookings = tourBookings?.length || 0
  const totalRevenue = tourBookings?.reduce((sum, b) => sum + b.total_amount_rwf, 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <Compass className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-amber-900">Tour Guide Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-amber-600">Tour Guide</Badge>
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
                  <p className="text-sm text-gray-600 mb-1">Total Tour Bookings</p>
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
                  <p className="text-sm text-gray-600 mb-1">Pending Tours</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {tours?.filter((t) => t.status === "pending").length || 0}
                  </p>
                </div>
                <Compass className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tour Revenue</p>
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

        {/* Tours List */}
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
      </div>
    </div>
  )
}

