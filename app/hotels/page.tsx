import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"

export default async function HotelsPage() {
  const supabase = await createClient()

  const { data: hotels } = await supabase
    .from("hotels")
    .select("*")
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Luxury Hotels in Rwanda</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience world-class hospitality in the heart of Africa
          </p>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels?.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden hover:shadow-xl transition-all">
              <div className="relative h-56 bg-gray-200">
                <Image
                  src={hotel.images[0] || "/placeholder.svg?height=300&width=400"}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
                {hotel.featured && <Badge className="absolute top-4 right-4 bg-amber-500">Featured</Badge>}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: hotel.star_rating || 0 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">{hotel.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{hotel.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.amenities.slice(0, 3).map((amenity: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-lg font-bold text-blue-600">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                      }).format(hotel.price_per_night_rwf)}
                      <span className="text-sm font-normal text-gray-500">/night</span>
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/hotels/${hotel.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!hotels || hotels.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hotels available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
