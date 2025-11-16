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
import { Search, Clock, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Image from "next/image"

interface Tour {
  id: string
  name: string
  description: string
  duration_days: number
  max_participants: number
  price_per_person_rwf: number
  included_services: string[]
  status: string
  images: string[]
  provider_id: string | null
  created_at: string
}

interface ToursDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ToursDialog({ open, onOpenChange }: ToursDialogProps) {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchTours()
    }
  }, [open])

  useEffect(() => {
    filterAndSortTours()
  }, [tours, searchQuery, sortBy, statusFilter])

  const fetchTours = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setTours(data || [])
    } catch (error) {
      console.error("Error fetching tours:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortTours = () => {
    let filtered = [...tours]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tour) =>
          (tour.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tour.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tour) => tour.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a.name || ""
          const nameB = b.name || ""
          return nameA.localeCompare(nameB)
        case "price_asc":
          return (a.price_per_person_rwf || 0) - (b.price_per_person_rwf || 0)
        case "price_desc":
          return (b.price_per_person_rwf || 0) - (a.price_per_person_rwf || 0)
        case "duration":
          return (a.duration_days || 0) - (b.duration_days || 0)
        default:
          return 0
      }
    })

    setFilteredTours(filtered)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>All Tours</DialogTitle>
              <DialogDescription>View and manage all tours in the system</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTours}
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
              placeholder="Search tours by name or description..."
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
              <SelectItem value="rejected">Rejected</SelectItem>
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
              <SelectItem value="duration">Duration (Short to Long)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tours List */}
        {loading ? (
          <div className="text-center py-8">Loading tours...</div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tours found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={tour.images[0] || "/placeholder.svg?height=200&width=400"}
                    alt={tour.name || "Tour image"}
                    fill
                    className="object-cover"
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${
                      tour.status === "approved"
                        ? "bg-emerald-600"
                        : tour.status === "pending"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  >
                    {tour.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{tour.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tour.description}</p>
                  
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{tour.duration_days} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Max {tour.max_participants}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price per person:</span>
                      <span className="font-bold text-amber-600">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(tour.price_per_person_rwf)}
                      </span>
                    </div>
                  </div>

                  {tour.included_services && tour.included_services.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Includes:</p>
                      <div className="space-y-1">
                        {tour.included_services.slice(0, 3).map((service, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            <span>{service}</span>
                          </div>
                        ))}
                        {tour.included_services.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{tour.included_services.length - 3} more services
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

