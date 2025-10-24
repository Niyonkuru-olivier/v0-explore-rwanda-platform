import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default async function AttractionsPage() {
  const supabase = await createClient()

  const { data: attractions } = await supabase
    .from("attractions")
    .select("*")
    .order("featured", { ascending: false })
    .order("name")

  const categories = ["all", "wildlife", "nature", "culture", "adventure"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">Explore Rwanda's Attractions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover breathtaking national parks, cultural sites, and natural wonders
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Badge key={category} variant="outline" className="cursor-pointer hover:bg-emerald-100 capitalize">
              {category}
            </Badge>
          ))}
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions?.map((attraction) => (
            <Card key={attraction.id} className="overflow-hidden hover:shadow-xl transition-all">
              <div className="relative h-56 bg-gray-200">
                <Image
                  src={attraction.images[0] || "/placeholder.svg?height=300&width=400"}
                  alt={attraction.name}
                  fill
                  className="object-cover"
                />
                {attraction.featured && <Badge className="absolute top-4 right-4 bg-amber-500">Featured</Badge>}
              </div>
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-2 capitalize">
                  {attraction.category}
                </Badge>
                <h3 className="text-xl font-bold mb-2 text-emerald-900">{attraction.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{attraction.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Entry Fee</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                      }).format(attraction.entry_fee_rwf)}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/attractions/${attraction.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!attractions || attractions.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No attractions found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
