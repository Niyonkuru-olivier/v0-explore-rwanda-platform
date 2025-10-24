import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tour } = await supabase.from("tours").select("*").eq("id", id).eq("status", "approved").single()

  if (!tour) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={tour.images[0] || "/placeholder.svg?height=400&width=600"}
                alt={tour.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {tour.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="relative h-44 rounded-lg overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg?height=200&width=300"}
                    alt={`${tour.name} ${index + 2}`}
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
              <h1 className="text-4xl font-bold text-amber-900 mb-4">{tour.name}</h1>

              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{tour.duration_days} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Max {tour.max_participants} participants</span>
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Tour</h2>
                <p className="text-gray-700 leading-relaxed">{tour.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.included_services.map((service: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-amber-200">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Price per person</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                      }).format(tour.price_per_person_rwf)}
                    </p>
                  </div>

                  <Button className="w-full bg-amber-600 hover:bg-amber-700 mb-4" size="lg" asChild>
                    <Link href={`/book/tour/${tour.id}`}>Book This Tour</Link>
                  </Button>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Tour Details</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Duration: {tour.duration_days} days</li>
                      <li>• Max group: {tour.max_participants} people</li>
                      <li>• Professional guide included</li>
                      <li>• Flexible booking options</li>
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
