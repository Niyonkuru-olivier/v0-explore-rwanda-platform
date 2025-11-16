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
import { Search, Car, MapPin, Phone, Mail, RefreshCw, Users } from "lucide-react"
import Image from "next/image"

interface Vehicle {
  id: string
  name: string
  location: string
  latitude: number | null
  longitude: number | null
  vehicle_type: string | null
  seats: number | null
  price_per_day_rwf: number
  status: string
  images: string[]
  provider_id: string | null
  description: string | null
  phone: string | null
  email: string | null
  company_name: string | null
  number_of_vehicles: number | null
  vehicle_capacity: number | null
}

interface VehiclesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statusFilter?: "all" | "pending" | "approved"
}

export function VehiclesDialog({ open, onOpenChange, statusFilter = "all" }: VehiclesDialogProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [loading, setLoading] = useState(true)
  const [weatherMap, setWeatherMap] = useState<Map<string, any>>(new Map())

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchVehicles()
    }
  }, [open, statusFilter])

  useEffect(() => {
    filterAndSortVehicles()
  }, [vehicles, searchQuery, sortBy])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      let query = supabase.from("car_rentals").select("*").order("created_at", { ascending: false })

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query

      if (error) throw error

      setVehicles(data || [])

      // Fetch weather data
      if (data && data.length > 0) {
        fetchWeatherData(data)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherData = async (vehiclesData: Vehicle[]) => {
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
      new Set(vehiclesData.map((v) => normalizePlace(v.location)).filter(Boolean) as string[])
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

  const filterAndSortVehicles = () => {
    let filtered = [...vehicles]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (vehicle) =>
          (vehicle.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle.vehicle_type || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a.name || ""
          const nameB = b.name || ""
          return nameA.localeCompare(nameB)
        case "price_asc":
          return (a.price_per_day_rwf || 0) - (b.price_per_day_rwf || 0)
        case "price_desc":
          return (b.price_per_day_rwf || 0) - (a.price_per_day_rwf || 0)
        case "seats":
          return (b.seats || 0) - (a.seats || 0)
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
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

  const dialogTitle =
    statusFilter === "pending"
      ? "Pending Vehicles"
      : statusFilter === "approved"
        ? "Approved Vehicles"
        : "All Vehicles"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>View and manage all vehicles in the system</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVehicles}
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
              placeholder="Search vehicles by name, location, company, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price_asc">Price (Low to High)</SelectItem>
              <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              <SelectItem value="seats">Seats (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vehicles List */}
        {loading ? (
          <div className="text-center py-8">Loading vehicles...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No vehicles found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVehicles.map((vehicle) => {
              const weather = getWeather(vehicle.location)
              return (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={vehicle.images[0] || "/placeholder.svg?height=200&width=400"}
                      alt={vehicle.name || "Vehicle image"}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${
                        vehicle.status === "approved"
                          ? "bg-emerald-600"
                          : vehicle.status === "pending"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{vehicle.name || "Unnamed Vehicle"}</h3>
                    {vehicle.company_name && (
                      <p className="text-sm font-medium text-blue-600 mb-1">{vehicle.company_name}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{vehicle.location || "Location not specified"}</span>
                        {weather && (
                          <span className="text-emerald-700 font-semibold">
                            {Math.round(weather.main?.temp)}°C
                          </span>
                        )}
                      </div>
                      {vehicle.vehicle_type && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Car className="h-4 w-4" />
                          <span className="capitalize">{vehicle.vehicle_type}</span>
                        </div>
                      )}
                      {vehicle.seats && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{vehicle.seats} seats</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Price per day:</span>
                        <span className="font-bold text-blue-600">
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            minimumFractionDigits: 0,
                          }).format(vehicle.price_per_day_rwf || 0)}
                        </span>
                      </div>
                      {vehicle.number_of_vehicles && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Number of vehicles:</span>
                          <span className="font-semibold">{vehicle.number_of_vehicles}</span>
                        </div>
                      )}
                      {vehicle.vehicle_capacity && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Vehicle capacity:</span>
                          <span className="font-semibold">{vehicle.vehicle_capacity}</span>
                        </div>
                      )}
                      {vehicle.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{vehicle.phone}</span>
                        </div>
                      )}
                      {vehicle.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="text-xs">{vehicle.email}</span>
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

