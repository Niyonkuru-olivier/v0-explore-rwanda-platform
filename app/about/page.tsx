import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mountain, Users, Award, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-700 to-blue-900">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">About Explore Rwanda</h1>
          <p className="text-xl md:text-2xl text-balance max-w-3xl mx-auto">
            Your trusted partner in discovering the beauty and wonder of Rwanda
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We are dedicated to showcasing Rwanda's incredible natural beauty, rich culture, and warm hospitality to
              travelers from around the world. Our platform connects tourists with authentic experiences, trusted
              accommodations, and expert guides to create unforgettable journeys through the Land of a Thousand Hills.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mountain className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-emerald-900">Authenticity</h3>
                <p className="text-gray-600 text-sm">
                  We showcase genuine Rwandan experiences and connect you with local communities
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">Community</h3>
                <p className="text-gray-600 text-sm">
                  We support local businesses and contribute to sustainable tourism development
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-900">Excellence</h3>
                <p className="text-gray-600 text-sm">
                  We partner with top-rated hotels, guides, and attractions to ensure quality
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-red-900">Passion</h3>
                <p className="text-gray-600 text-sm">
                  We love Rwanda and are passionate about sharing its wonders with the world
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-gray-600">Partner Hotels</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Tour Packages</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-600 mb-2">25+</div>
              <div className="text-gray-600">Attractions</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Travelers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Rwanda Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 text-center mb-8">Why Visit Rwanda?</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Rwanda, known as the "Land of a Thousand Hills," is a country of breathtaking natural beauty and
              remarkable resilience. From the mist-covered mountains where endangered mountain gorillas roam to the
              pristine shores of Lake Kivu, Rwanda offers diverse landscapes and unforgettable wildlife encounters.
            </p>
            <p>
              The country has emerged as one of Africa's premier safari destinations, with world-class national parks
              including Volcanoes National Park, Akagera National Park, and Nyungwe Forest. Beyond wildlife, Rwanda's
              vibrant culture, warm hospitality, and commitment to conservation make it a truly special destination.
            </p>
            <p>
              Kigali, the capital city, is one of Africa's cleanest and safest cities, offering modern amenities,
              excellent restaurants, and fascinating museums that tell the story of Rwanda's past and its inspiring
              journey toward unity and prosperity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore Rwanda?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start planning your adventure today and discover why Rwanda is called the Pearl of Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100" asChild>
              <Link href="/attractions">
                Browse Attractions <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 bg-transparent"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
