import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight, Mountain, Hotel, Compass, Star } from "lucide-react"
import Image from "next/image"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredAttractions } = await supabase.from("attractions").select("*").eq("featured", true).limit(3)

  const { data: featuredHotels } = await supabase
    .from("hotels")
    .select("*")
    .eq("featured", true)
    .eq("status", "approved")
    .limit(3)

  const { data: featuredTours } = await supabase
    .from("tours")
    .select("*")
    .eq("featured", true)
    .eq("status", "approved")
    .limit(3)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-700 to-blue-900">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">Discover the Land of a Thousand Hills</h1>
          <p className="text-xl md:text-2xl mb-8 text-balance max-w-3xl mx-auto">
            Experience Rwanda's breathtaking wildlife, stunning landscapes, and rich culture
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg" asChild>
              <Link href="/attractions">
                Explore Attractions <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white text-lg"
              asChild
            >
              <Link href="/tours">View Tours</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mountain className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-emerald-900">Amazing Attractions</h3>
                <p className="text-gray-600">
                  From mountain gorillas to pristine lakes, discover Rwanda's natural wonders
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hotel className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">Luxury Hotels</h3>
                <p className="text-gray-600">
                  Stay in world-class accommodations with stunning views and exceptional service
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-900">Guided Tours</h3>
                <p className="text-gray-600">Expert guides lead you through unforgettable adventures across Rwanda</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      {featuredAttractions && featuredAttractions.length > 0 && (
        <section className="py-16 bg-emerald-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-900">Featured Attractions</h2>
              <Button variant="outline" asChild>
                <Link href="/attractions">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredAttractions.map((attraction) => (
                <Card key={attraction.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={attraction.images[0] || "/placeholder.svg?height=200&width=400"}
                      alt={attraction.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-emerald-900">{attraction.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{attraction.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-600 font-semibold">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(attraction.entry_fee_rwf)}
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/attractions/${attraction.id}`}>Learn More</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Hotels */}
      {featuredHotels && featuredHotels.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900">Featured Hotels</h2>
              <Button variant="outline" asChild>
                <Link href="/hotels">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredHotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={hotel.images[0] || "/placeholder.svg?height=200&width=400"}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: hotel.star_rating || 0 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-blue-900">{hotel.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(hotel.price_per_night_rwf)}
                        /night
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/hotels/${hotel.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Tours */}
      {featuredTours && featuredTours.length > 0 && (
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-amber-900">Featured Tours</h2>
              <Button variant="outline" asChild>
                <Link href="/tours">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTours.map((tour) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={tour.images[0] || "/placeholder.svg?height=200&width=400"}
                      alt={tour.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-amber-900">{tour.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tour.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-amber-600 font-semibold">
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            minimumFractionDigits: 0,
                          }).format(tour.price_per_person_rwf)}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">{tour.duration_days} days</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/tours/${tour.id}`}>View Tour</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 text-balance max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the magic of Rwanda
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg" asChild>
            <Link href="/auth/sign-up">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
