import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Plus, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function TransportDashboardPage() {
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
  if (profile.provider_type !== "transport") {
    redirect("/dashboard/provider")
  }

  // Fetch provider's transport services
  const { data: transportServices } = await supabase
    .from("transport_services")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  const pendingRoutes = transportServices?.filter((t) => t.status === "pending").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-emerald-900">Transport Service Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-emerald-600">Transport Service</Badge>
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
                  <p className="text-sm text-gray-600 mb-1">Total Routes</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {transportServices?.length || 0}
                  </p>
                </div>
                <Truck className="h-10 w-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Routes</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingRoutes}</p>
                </div>
                <Truck className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved Routes</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {transportServices?.filter((t) => t.status === "approved").length || 0}
                  </p>
                </div>
                <Truck className="h-10 w-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transport Services List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-emerald-900 flex items-center gap-2">
              <Truck className="h-6 w-6" />
              My Transport Services
            </CardTitle>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/provider/transport-services/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Route
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {transportServices && transportServices.length > 0 ? (
              <div className="space-y-4">
                {transportServices.map((service: any) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <p className="text-sm text-gray-600">
                        {service.origin} → {service.destination}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={
                            service.status === "approved"
                              ? "default"
                              : service.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            service.status === "approved"
                              ? "bg-emerald-600"
                              : service.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }
                        >
                          {service.status}
                        </Badge>
                        <Badge variant="outline">
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            minimumFractionDigits: 0,
                          }).format(service.price_per_trip_rwf)}
                          /trip
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/transport-services/${service.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/provider/transport-services/${service.id}/edit`}>
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
                <p>No transport services yet. Add your first route to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

