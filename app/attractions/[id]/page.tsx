import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function AttractionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: attraction } = await supabase.from("attractions").select("*").eq("id", id).single()

  if (!attraction) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={attraction.images[0] || "/placeholder.svg?height=400&width=600"}
                alt={attraction.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {attraction.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="relative h-44 rounded-lg overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg?height=200&width=300"}
                    alt={`${attraction.name} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Badge variant="secondary" className="mb-4 capitalize">
                {attraction.category}
              </Badge>
              <h1 className="text-4xl font-bold text-emerald-900 mb-4">{attraction.name}</h1>

              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{attraction.location}</span>
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{attraction.description}</p>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-emerald-200">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Entry Fee</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                      }).format(attraction.entry_fee_rwf)}
                    </p>
                    <p className="text-sm text-gray-500">per person</p>
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 mb-4" size="lg" asChild>
                    <Link href={`/book/attraction/${attraction.id}`}>
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Now
                    </Link>
                  </Button>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">What to Know</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Booking confirmation required</li>
                      <li>• Valid ID needed at entry</li>
                      <li>• Weather-dependent activities</li>
                      <li>• Professional guides available</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
