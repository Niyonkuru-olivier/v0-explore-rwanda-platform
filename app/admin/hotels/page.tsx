import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Check, X, Eye } from "lucide-react"
import { approveHotel, rejectHotel } from "./actions"

export default async function AdminHotelsPage() {
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

  const { data: hotels } = await supabase
    .from("hotels")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Manage Hotels</h1>
          <p className="text-gray-600">Review and approve hotel listings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">All Hotels</CardTitle>
          </CardHeader>
          <CardContent>
            {hotels && hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                      <p className="text-sm text-gray-600">{hotel.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Provider: {(hotel.profiles as any)?.full_name || "Unknown"}
                      </p>
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
                        {hotel.featured && <Badge className="bg-amber-500">Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/hotels/${hotel.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {hotel.status === "pending" && (
                        <>
                          <form action={async () => await approveHotel(hotel.id)}>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </form>
                          <form action={async () => await rejectHotel(hotel.id)}>
                            <Button type="submit" size="sm" variant="destructive">
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hotels found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
