import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, Wifi, Coffee, Car, Utensils } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  restaurant: Utensils,
  breakfast: Coffee,
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: hotel } = await supabase.from("hotels").select("*").eq("id", id).eq("status", "approved").single()

  if (!hotel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={hotel.images[0] || "/placeholder.svg?height=400&width=600"}
                alt={hotel.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {hotel.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="relative h-44 rounded-lg overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg?height=200&width=300"}
                    alt={`${hotel.name} ${index + 2}`}
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
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: hotel.star_rating || 0 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h1 className="text-4xl font-bold text-blue-900 mb-4">{hotel.name}</h1>

              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="h-5 w-5" />
                <span>{hotel.location}</span>
              </div>

              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {hotel.amenities.map((amenity: string, index: number) => {
                    const Icon = amenityIcons[amenity.toLowerCase()] || Coffee
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-blue-200">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Price per night</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                      }).format(hotel.price_per_night_rwf)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600">Available Rooms</p>
                    <p className="text-lg font-semibold">{hotel.available_rooms} rooms</p>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-4" size="lg" asChild>
                    <Link href={`/book/hotel/${hotel.id}`}>Book Now</Link>
                  </Button>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Booking Info</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Free cancellation up to 24h</li>
                      <li>• Check-in: 2:00 PM</li>
                      <li>• Check-out: 11:00 AM</li>
                      <li>• Valid ID required</li>
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
