import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, Eye, Edit } from "lucide-react"

export default async function AdminAttractionsPage() {
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

  const { data: attractions } = await supabase.from("attractions").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">Manage Attractions</h1>
            <p className="text-gray-600">Add and manage tourist attractions</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/admin/attractions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Attraction
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">All Attractions</CardTitle>
          </CardHeader>
          <CardContent>
            {attractions && attractions.length > 0 ? (
              <div className="space-y-4">
                {attractions.map((attraction) => (
                  <div key={attraction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{attraction.name}</h3>
                      <p className="text-sm text-gray-600">{attraction.location}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {attraction.category}
                        </Badge>
                        <Badge variant="outline">
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            minimumFractionDigits: 0,
                          }).format(attraction.entry_fee_rwf)}
                        </Badge>
                        {attraction.featured && <Badge className="bg-amber-500">Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/attractions/${attraction.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/attractions/${attraction.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No attractions found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
