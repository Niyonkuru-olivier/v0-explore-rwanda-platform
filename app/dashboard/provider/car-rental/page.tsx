import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Plus, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CarRentalStats } from "@/components/dashboard/car-rental-stats"

export default async function CarRentalDashboardPage() {
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
  if (profile.provider_type !== "car_rental") {
    redirect("/dashboard/provider")
  }

  // Fetch provider's car rentals
  const { data: carRentals } = await supabase
    .from("car_rentals")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  const pendingVehicles = carRentals?.filter((car) => car.status === "pending").length || 0
  const approvedVehicles = carRentals?.filter((car) => car.status === "approved").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Car className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-blue-900">Car Rental Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-600">Car Rental Service</Badge>
                <span className="text-gray-600">•</span>
                <p className="text-gray-600">{profile.full_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics - Clickable Cards */}
        <CarRentalStats
          totalVehicles={carRentals?.length || 0}
          pendingVehicles={pendingVehicles}
          approvedVehicles={approvedVehicles}
        />

        {/* Car Rentals List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
              <Car className="h-6 w-6" />
              My Car Rentals
            </CardTitle>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/provider/car-rentals/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle/Company
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {carRentals && carRentals.length > 0 ? (
              <div className="space-y-4">
                {carRentals
                  .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""))
                  .map((car: any) => (
                  <div
                    key={car.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{car.name || "Unnamed Vehicle"}</h3>
                      {car.company_name && (
                        <p className="text-sm font-medium text-blue-600 mb-1">{car.company_name}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {car.location || "Location not specified"}
                        {car.vehicle_type && ` • ${car.vehicle_type}`}
                        {car.seats && ` • ${car.seats} seats`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                          variant={
                            car.status === "approved"
                              ? "default"
                              : car.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            car.status === "approved"
                              ? "bg-emerald-600"
                              : car.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }
                        >
                          {car.status || "pending"}
                        </Badge>
                        {car.price_per_day_rwf && (
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(car.price_per_day_rwf)}
                            /day
                          </Badge>
                        )}
                        {car.number_of_vehicles && (
                          <Badge variant="outline">Vehicles: {car.number_of_vehicles}</Badge>
                        )}
                        {car.vehicle_capacity && (
                          <Badge variant="outline">Capacity: {car.vehicle_capacity}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/car-rentals/${car.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/provider/car-rentals/${car.id}/edit`}>
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
                <p>No vehicles yet. Add your first car rental to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

