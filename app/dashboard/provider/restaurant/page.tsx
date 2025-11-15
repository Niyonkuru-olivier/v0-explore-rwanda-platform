import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Utensils, Plus, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function RestaurantDashboardPage() {
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
  if (profile.provider_type !== "restaurant") {
    redirect("/dashboard/provider")
  }

  // Fetch provider's restaurants
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  const pendingRestaurants = restaurants?.filter((r) => r.status === "pending").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <Utensils className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-amber-900">Restaurant Owner Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-amber-600">Restaurant Owner</Badge>
                <span className="text-gray-600">•</span>
                <p className="text-gray-600">{profile.full_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Restaurants</p>
                  <p className="text-3xl font-bold text-amber-600">{restaurants?.length || 0}</p>
                </div>
                <Utensils className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Restaurants</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingRestaurants}</p>
                </div>
                <Utensils className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved Restaurants</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {restaurants?.filter((r) => r.status === "approved").length || 0}
                  </p>
                </div>
                <Utensils className="h-10 w-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
              <Utensils className="h-6 w-6" />
              My Restaurants
            </CardTitle>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/provider/restaurants/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Restaurant
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {restaurants && restaurants.length > 0 ? (
              <div className="space-y-4">
                {restaurants.map((restaurant: any) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">
                        {restaurant.location} • {restaurant.cuisine_type}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={
                            restaurant.status === "approved"
                              ? "default"
                              : restaurant.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            restaurant.status === "approved"
                              ? "bg-emerald-600"
                              : restaurant.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }
                        >
                          {restaurant.status}
                        </Badge>
                        {restaurant.average_price_rwf && (
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(restaurant.average_price_rwf)}
                            /meal
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/restaurants/${restaurant.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/provider/restaurants/${restaurant.id}/edit`}>
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
                <p>No restaurants yet. Add your first restaurant to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

