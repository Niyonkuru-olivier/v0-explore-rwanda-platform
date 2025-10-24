import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Clock, Users } from "lucide-react"

export default async function ToursPage() {
  const supabase = await createClient()

  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">Guided Tours & Adventures</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore Rwanda with expert guides and unforgettable experiences
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours?.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-all">
              <div className="relative h-56 bg-gray-200">
                <Image
                  src={tour.images[0] || "/placeholder.svg?height=300&width=400"}
                  alt={tour.name}
                  fill
                  className="object-cover"
                />
                {tour.featured && <Badge className="absolute top-4 right-4 bg-amber-500">Featured</Badge>}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-amber-900">{tour.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tour.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{tour.duration_days} days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Max {tour.max_participants}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-lg font-bold text-amber-600">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                      }).format(tour.price_per_person_rwf)}
                      <span className="text-sm font-normal text-gray-500">/person</span>
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/tours/${tour.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!tours || tours.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tours available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
