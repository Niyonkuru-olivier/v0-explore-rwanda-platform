"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Search, Star, MapPin, Phone, RefreshCw } from "lucide-react"
import Image from "next/image"

interface Hotel {
  id: string
  name: string
  location: string
  latitude: number | null
  longitude: number | null
  star_rating: number | null
  price_per_night_rwf: number
  available_rooms: number
  status: string
  images: string[]
  amenities: string[]
  provider_id: string | null
  description: string
}

interface HotelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HotelsDialog({ open, onOpenChange }: HotelsDialogProps) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [weatherMap, setWeatherMap] = useState<Map<string, any>>(new Map())

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchHotels()
    }
  }, [open])

  useEffect(() => {
    filterAndSortHotels()
  }, [hotels, searchQuery, sortBy, statusFilter])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .neq("status", "rejected")
        .order("created_at", { ascending: false })

      if (error) throw error

      setHotels(data || [])

      // Fetch weather data
      if (data && data.length > 0) {
        fetchWeatherData(data)
      }
    } catch (error) {
      console.error("Error fetching hotels:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherData = async (hotelsData: Hotel[]) => {
    const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY
    if (!WEATHER_API_KEY) return

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
      new Set(hotelsData.map((h) => normalizePlace(h.location)).filter(Boolean) as string[])
    )

    const weather = new Map<string, any>()
    try {
      await Promise.all(
        places.map(async (p) => {
          const c = rwCoords[p]
          if (!c) return
          try {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${c.lat}&lon=${c.lon}&units=metric&appid=${WEATHER_API_KEY}`
            )
            if (res.ok) {
              weather.set(p, await res.json())
            }
          } catch {}
        })
      )
      setWeatherMap(weather)
    } catch {}
  }

  const filterAndSortHotels = () => {
    let filtered = [...hotels]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (hotel) =>
          (hotel.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (hotel.location || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter (exclude rejected hotels)
    if (statusFilter !== "all") {
      filtered = filtered.filter((hotel) => hotel.status === statusFilter)
    } else {
      // Even when showing "all", exclude rejected
      filtered = filtered.filter((hotel) => hotel.status !== "rejected")
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a.name || ""
          const nameB = b.name || ""
          return nameA.localeCompare(nameB)
        case "price_asc":
          return (a.price_per_night_rwf || 0) - (b.price_per_night_rwf || 0)
        case "price_desc":
          return (b.price_per_night_rwf || 0) - (a.price_per_night_rwf || 0)
        case "rating":
          return (b.star_rating || 0) - (a.star_rating || 0)
        default:
          return 0
      }
    })

    setFilteredHotels(filtered)
  }

  const normalizePlace = (input?: string | null): string | null => {
    if (!input) return null
    const base = String(input).split(",")[0].trim().toLowerCase()
    return base || null
  }

  const getWeather = (location: string | null) => {
    if (!location) return null
    const place = normalizePlace(location)
    return place ? weatherMap.get(place) : null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>All Hotels</DialogTitle>
              <DialogDescription>View and manage all hotels in the system</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHotels}
              disabled={loading}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search hotels by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price_asc">Price (Low to High)</SelectItem>
              <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              <SelectItem value="rating">Rating (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hotels List */}
        {loading ? (
          <div className="text-center py-8">Loading hotels...</div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hotels found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHotels.map((hotel) => {
              const weather = getWeather(hotel.location)
              return (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={hotel.images[0] || "/placeholder.svg?height=200&width=400"}
                      alt={hotel.name || "Hotel image"}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${
                        hotel.status === "approved"
                          ? "bg-emerald-600"
                          : hotel.status === "pending"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    >
                      {hotel.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{hotel.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{hotel.location}</span>
                        {weather && (
                          <span className="text-emerald-700 font-semibold">
                            {Math.round(weather.main?.temp)}°C
                          </span>
                        )}
                      </div>
                      {hotel.star_rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: hotel.star_rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Price per night:</span>
                        <span className="font-bold text-emerald-600">
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            minimumFractionDigits: 0,
                          }).format(hotel.price_per_night_rwf)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Available rooms:</span>
                        <span className="font-semibold">{hotel.available_rooms}</span>
                      </div>
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hotel.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

