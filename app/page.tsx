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

  const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY
  const STOCK_API_KEY = process.env.NEXT_PUBLIC_STOCK_API_KEY

  const weatherPlaces = [
    "Kigali",
    "Musanze",
    "Rubavu",
    "Nyagatare",
    "Nyabihu",
    "Karongi",
    "Rusizi",
    "Huye",
    "Muhanga",
  ]

  type WxItem = { name: string; temp?: number; desc?: string }
  let weatherLocations: WxItem[] = []
  try {
    if (WEATHER_API_KEY) {
      const geocoded = await Promise.all(
        weatherPlaces.map(async (name) => {
          const geo = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(name + ", Rwanda")}&limit=1&appid=${WEATHER_API_KEY}`,
            { next: { revalidate: 86400 } }
          )
          if (!geo.ok) return null
          const arr = await geo.json()
          const g = Array.isArray(arr) && arr[0] ? arr[0] : null
          if (!g?.lat || !g?.lon) return null
          const wx = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${g.lat}&lon=${g.lon}&units=metric&appid=${WEATHER_API_KEY}`,
            { next: { revalidate: 600 } }
          )
          if (!wx.ok) return { name }
          const j = await wx.json()
          return { name, temp: j?.main?.temp, desc: j?.weather?.[0]?.description }
        })
      )
      weatherLocations = geocoded.filter(Boolean) as WxItem[]
    }
  } catch {}

  let rseData: any[] = []
  let rseError: string | null = null
  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    // Try a more specific market data page first, then fall back to homepage
    const urls = [
      "https://www.rse.rw/en/market-data/equities",
      "https://www.rse.rw/",
    ]
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers, next: { revalidate: 1800 } })
        if (!res.ok) {
          rseError = `HTTP ${res.status} from ${url}`
          continue
        }
        const html = await res.text()
        if (!html || html.length < 100) {
          rseError = `Empty or invalid response from ${url}`
          continue
        }
        const items: any[] = []
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
        let m
        while ((m = rowRegex.exec(html))) {
          const row = m[1]
          const cols = Array.from(row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)).map((c) => c[1].replace(/<[^>]+>/g, "").trim())
          if (cols.length >= 3 && /BK|BLR|KCB|EABL|UCHMI|IMBANK|CBHL|COOP|CIMERWA/i.test(cols.join(" "))) {
            const symbol = (cols[0] || "").toUpperCase().replace(/\s+.*/, "")
            const name = cols[0] || symbol
            const price = parseFloat((cols[1] || "").replace(/[^0-9.\-]/g, ""))
            const changePct = parseFloat((cols[3] || cols[2] || "").replace(/[^0-9.\-]/g, ""))
            if (symbol && !Number.isNaN(price) && price > 0) {
              items.push({ symbol, name, price, changesPercentage: changePct })
            }
          }
        }
        if (items.length > 0) {
          rseData = items.slice(0, 8)
          rseError = null
          break
        } else {
          rseError = `No valid stock data found in ${url}`
        }
      } catch (fetchError) {
        rseError = `Fetch error for ${url}: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`
        continue
      }
    }
    // Log error if data fetching failed (only in development)
    if (rseData.length === 0 && rseError && process.env.NODE_ENV === "development") {
      console.warn("RSE Data Fetch Error:", rseError)
    }
  } catch (error) {
    rseError = error instanceof Error ? error.message : "Unknown error occurred"
    if (process.env.NODE_ENV === "development") {
      console.error("RSE Data Fetch Exception:", rseError)
    }
  }

  let fxRates: any | null = null
  try {
    // Primary: open.er-api.com, widely available
    const res = await fetch("https://open.er-api.com/v6/latest/RWF", { next: { revalidate: 3600 } })
    if (res.ok) {
      const json = await res.json()
      if (json && json.rates) {
        const wanted = ["USD", "EUR", "KES", "TZS"] as const
        fxRates = { rates: Object.fromEntries(wanted.map((k) => [k, json.rates[k]]).filter(([, v]) => typeof v === "number")) }
      }
    }
    // Fallback: exchangerate.host if needed
    if (!fxRates?.rates || Object.keys(fxRates.rates).length === 0) {
      const r2 = await fetch("https://api.exchangerate.host/latest?base=RWF&symbols=USD,EUR,KES,TZS", { next: { revalidate: 3600 } })
      if (r2.ok) fxRates = await r2.json()
    }
  } catch {}

  let kpiArrivals: { year: number; value: number } | null = null
  let kpiReceipts: { year: number; value: number } | null = null
  try {
    const [arvlRes, rcptRes] = await Promise.all([
      fetch("https://api.worldbank.org/v2/country/RWA/indicator/ST.INT.ARVL?format=json&per_page=60", { next: { revalidate: 86400 } }),
      fetch("https://api.worldbank.org/v2/country/RWA/indicator/ST.INT.RCPT.CD?format=json&per_page=60", { next: { revalidate: 86400 } }),
    ])
    if (arvlRes.ok) {
      const json = await arvlRes.json()
      const series = Array.isArray(json) ? json[1] : null
      const latest = Array.isArray(series) ? series.find((d: any) => d.value != null) : null
      if (latest) kpiArrivals = { year: Number(latest.date), value: Number(latest.value) }
    }
    if (rcptRes.ok) {
      const json = await rcptRes.json()
      const series = Array.isArray(json) ? json[1] : null
      const latest = Array.isArray(series) ? series.find((d: any) => d.value != null) : null
      if (latest) kpiReceipts = { year: Number(latest.date), value: Number(latest.value) }
    }
  } catch {}

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

      {/* Weather and Market Watch */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Weather Card */}
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full min-h-[280px]">
              <CardContent className="p-6 flex flex-col flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-emerald-900">Weather across Rwanda</h2>
                <div className="flex-1 flex items-center min-h-[180px]">
                  {Array.isArray(weatherLocations) && weatherLocations.length > 0 ? (
                    <div className="weather-marquee w-full h-full">
                      <div className="weather-marquee-content">
                        {[...weatherLocations, ...weatherLocations].map((w, idx) => {
                          // Color schemes for different locations - cycle through colors
                          const colorSchemes = [
                            { bg: "bg-emerald-50", border: "border-emerald-200", name: "text-emerald-900", temp: "text-emerald-700" },
                            { bg: "bg-blue-50", border: "border-blue-200", name: "text-blue-900", temp: "text-blue-700" },
                            { bg: "bg-indigo-50", border: "border-indigo-200", name: "text-indigo-900", temp: "text-indigo-700" },
                            { bg: "bg-purple-50", border: "border-purple-200", name: "text-purple-900", temp: "text-purple-700" },
                            { bg: "bg-amber-50", border: "border-amber-200", name: "text-amber-900", temp: "text-amber-700" },
                            { bg: "bg-rose-50", border: "border-rose-200", name: "text-rose-900", temp: "text-rose-700" },
                            { bg: "bg-cyan-50", border: "border-cyan-200", name: "text-cyan-900", temp: "text-cyan-700" },
                            { bg: "bg-teal-50", border: "border-teal-200", name: "text-teal-900", temp: "text-teal-700" },
                            { bg: "bg-violet-50", border: "border-violet-200", name: "text-violet-900", temp: "text-violet-700" },
                          ]
                          const originalIndex = idx % weatherLocations.length
                          const colors = colorSchemes[originalIndex % colorSchemes.length]
                          return (
                            <div key={idx} className={`weather-marquee-item ${colors.bg} rounded-lg border ${colors.border}`}>
                              <div className={`font-bold ${colors.name} text-lg md:text-xl`}>{w.name}</div>
                              {typeof w.temp === "number" ? (
                                <div className={`${colors.temp} font-bold text-2xl md:text-3xl`}>{Math.round(w.temp)}°C</div>
                              ) : (
                                <div className="text-gray-500 text-xl md:text-2xl">—</div>
                              )}
                              {w.desc && (
                                <div className="text-gray-600 capitalize text-sm md:text-base mt-1">{w.desc}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Weather data is not available right now.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rwanda Stock Exchange Card */}
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full min-h-[280px]">
              <CardContent className="p-6 flex flex-col flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-900">Rwanda Stock Exchange</h2>
                <div className="flex-1">
                  {Array.isArray(rseData) && rseData.length > 0 ? (
                    <div className="space-y-3">
                      {rseData.slice(0, 5).map((item: any) => (
                        <div key={item.symbol} className="flex items-center justify-between gap-2">
                          <div className="font-medium text-gray-800 text-sm md:text-base truncate flex-1">{item.name || item.symbol}</div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-gray-700 text-sm md:text-base font-semibold">{Number(item.price).toFixed(2)}</div>
                            <div className={`text-xs md:text-sm font-semibold ${Number(item.changesPercentage) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {Number(item.changesPercentage) >= 0 ? "+" : ""}{Number(item.changesPercentage).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">RSE data is not available right now.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RWF Exchange Rates Card */}
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full min-h-[280px]">
              <CardContent className="p-6 flex flex-col flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-900">RWF Exchange Rates</h2>
                <div className="flex-1">
                  {fxRates?.rates && Object.keys(fxRates.rates).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(fxRates.rates).map(([ccy, rate]: any) => (
                        <div key={ccy} className="flex items-center justify-between gap-2">
                          <div className="font-medium text-gray-800 text-sm md:text-base">1 RWF → {ccy}</div>
                          <div className="text-gray-700 text-sm md:text-base font-semibold">{Number(rate).toFixed(6)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">FX rates are not available right now.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tourism KPIs Card */}
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full min-h-[280px]">
              <CardContent className="p-6 flex flex-col flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-purple-900">Tourism KPIs</h2>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-gray-800 text-sm md:text-base">
                      International arrivals{typeof kpiArrivals?.year === "number" ? ` (${kpiArrivals.year})` : ""}
                    </div>
                    <div className="text-gray-700 text-base md:text-lg font-semibold">
                      {typeof kpiArrivals?.value === "number" ? new Intl.NumberFormat("en").format(kpiArrivals.value) : "—"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-gray-800 text-sm md:text-base">
                      Tourism receipts (US$){typeof kpiReceipts?.year === "number" ? ` (${kpiReceipts.year})` : ""}
                    </div>
                    <div className="text-gray-700 text-base md:text-lg font-semibold">
                      {typeof kpiReceipts?.value === "number" ? new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpiReceipts.value) : "—"}
                    </div>
                  </div>
                </div>
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
