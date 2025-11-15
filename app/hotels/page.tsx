import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"

export default async function HotelsPage() {
  const supabase = await createClient()

  // Fetch approved hotels
  let hotels: any[] | null = null
  let hotelsError: any = null

  try {
    // First, try a simple query without multiple order clauses
    const result = await supabase
      .from("hotels")
      .select("*")
      .eq("status", "approved")

    hotels = result.data
    hotelsError = result.error

    // Enhanced error logging
    if (hotelsError) {
      console.error("Error fetching hotels:", {
        message: hotelsError.message,
        details: hotelsError.details,
        hint: hotelsError.hint,
        code: hotelsError.code,
        fullError: JSON.stringify(hotelsError, Object.getOwnPropertyNames(hotelsError)),
      })
    }
  } catch (err) {
    console.error("Exception fetching hotels:", err)
    hotelsError = err
  }

  // Sort hotels: featured first, then by name
  if (hotels && !hotelsError) {
    hotels = hotels.sort((a, b) => {
      // Featured hotels first
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      // Then alphabetically by name
      return a.name.localeCompare(b.name)
    })
  }

  const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

  const rwCoords: Record<string, { lat: number; lon: number }> = {
    kigali: { lat: -1.95, lon: 30.06 },
    musanze: { lat: -1.5, lon: 29.63 },
    rubavu: { lat: -1.706, lon: 29.256 },
    gisenyi: { lat: -1.706, lon: 29.256 },
    nyagatare: { lat: -1.315, lon: 30.32 },
    nyabihu: { lat: -1.67, lon: 29.53 },
    karongi: { lat: -2.06, lon: 29.35 },
    rusizi: { lat: -2.51, lon: 28.9 },
    huye: { lat: -2.61, lon: 29.74 },
    muhanga: { lat: -2.076, lon: 29.756 },
  }

  function normalizePlace(input?: string | null): string | null {
    if (!input) return null
    const base = String(input).split(",")[0].trim().toLowerCase()
    return base || null
  }

  const places = Array.from(
    new Set((hotels || []).map((h: any) => normalizePlace(h.location)).filter(Boolean) as string[])
  )

  const weatherMap = new Map<string, any>()
  try {
    if (WEATHER_API_KEY) {
      await Promise.all(
        places.map(async (p) => {
          const c = rwCoords[p]
          if (!c) return
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${c.lat}&lon=${c.lon}&units=metric&appid=${WEATHER_API_KEY}`,
            { next: { revalidate: 600 } }
          )
          if (res.ok) {
            weatherMap.set(p, await res.json())
          }
        })
      )
    }
  } catch {}

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
                {(() => {
                  const loc = normalizePlace(hotel.location)
                  const w = loc ? weatherMap.get(loc) : null
                  return (
                    <div className="text-sm mb-2">
                      <span className="text-gray-700">{hotel.location || "Rwanda"}</span>
                      {w ? (
                        <span className="ml-2 text-blue-700 font-semibold">{Math.round(w.main?.temp)}°C</span>
                      ) : null}
                    </div>
                  )
                })()}
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
            <p className="text-gray-500 text-lg mb-4">No approved hotels available at the moment.</p>
            {hotelsError && (
              <p className="text-sm text-red-500">Error loading hotels. Please try again later.</p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              Hotels need to be approved by an administrator before they appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
