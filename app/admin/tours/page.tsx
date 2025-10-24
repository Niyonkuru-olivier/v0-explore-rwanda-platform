import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Check, X, Eye } from "lucide-react"

export default async function AdminToursPage() {
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

  const { data: tours } = await supabase
    .from("tours")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })

  const approveTour = async (tourId: string) => {
    "use server"
    const supabase = await createClient()
    await supabase.from("tours").update({ status: "approved" }).eq("id", tourId)
  }

  const rejectTour = async (tourId: string) => {
    "use server"
    const supabase = await createClient()
    await supabase.from("tours").update({ status: "rejected" }).eq("id", tourId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Manage Tours</h1>
          <p className="text-gray-600">Review and approve tour packages</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">All Tours</CardTitle>
          </CardHeader>
          <CardContent>
            {tours && tours.length > 0 ? (
              <div className="space-y-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{tour.name}</h3>
                      <p className="text-sm text-gray-600">
                        {tour.duration_days} days • Max {tour.max_participants} participants
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Provider: {(tour.profiles as any)?.full_name || "Unknown"}
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
                        {tour.featured && <Badge className="bg-amber-500">Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tours/${tour.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {tour.status === "pending" && (
                        <>
                          <form action={approveTour.bind(null, tour.id)}>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </form>
                          <form action={rejectTour.bind(null, tour.id)}>
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
              <p className="text-center text-gray-500 py-8">No tours found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
