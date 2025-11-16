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
import { Search, Check, X, RefreshCw, MapPin, User } from "lucide-react"
import Image from "next/image"

interface ApproveItem {
  id: string
  name: string
  location?: string | null
  status: string
  provider_id?: string | null
  provider_name?: string | null
  images?: string[]
  [key: string]: any
}

interface AdminApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  title: string
  description: string
  approveAction: (id: string) => Promise<void>
  rejectAction: (id: string) => Promise<void>
}

export function AdminApproveDialog({
  open,
  onOpenChange,
  tableName,
  title,
  description,
  approveAction,
  rejectAction,
}: AdminApproveDialogProps) {
  const [items, setItems] = useState<ApproveItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ApproveItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchItems()
    }
  }, [open, tableName])

  useEffect(() => {
    filterItems()
  }, [items, searchQuery, statusFilter])

  const fetchItems = async () => {
    try {
      setLoading(true)
      let query = supabase.from(tableName).select("*").order("created_at", { ascending: false })

      // If table has provider_id, join with profiles
      if (tableName === "hotels" || tableName === "tours" || tableName === "restaurants" || tableName === "car_rentals" || tableName === "transport_services") {
        query = query.select("*, profiles(full_name)")
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data to include provider_name and remove nested profiles
      const transformedData = (data || []).map((item: any) => {
        const { profiles, ...rest } = item
        // Handle profiles - it could be an object or null
        let providerName = null
        if (profiles) {
          if (typeof profiles === "object" && !Array.isArray(profiles)) {
            providerName = profiles.full_name || null
          } else if (Array.isArray(profiles) && profiles.length > 0) {
            providerName = profiles[0]?.full_name || null
          }
        }
        // Clean the item to ensure all values are primitives
        const cleanItem: any = {
          id: String(item.id || ""),
          name: String(item.name || ""),
          location: item.location ? String(item.location) : null,
          status: typeof item.status === "string" ? item.status : String(item.status || "pending"),
          provider_name: providerName,
          provider_id: item.provider_id ? String(item.provider_id) : null,
          images: Array.isArray(item.images) ? item.images : [],
          description: item.description ? String(item.description) : null,
        }
        // Add price fields if they exist
        if (item.price_per_night_rwf !== undefined) {
          cleanItem.price_per_night_rwf = Number(item.price_per_night_rwf) || 0
        }
        if (item.price_per_person_rwf !== undefined) {
          cleanItem.price_per_person_rwf = Number(item.price_per_person_rwf) || 0
        }
        if (item.price_per_day_rwf !== undefined) {
          cleanItem.price_per_day_rwf = Number(item.price_per_day_rwf) || 0
        }
        if (item.average_price_rwf !== undefined) {
          cleanItem.average_price_rwf = Number(item.average_price_rwf) || 0
        }
        if (item.price_per_trip_rwf !== undefined) {
          cleanItem.price_per_trip_rwf = Number(item.price_per_trip_rwf) || 0
        }
        return cleanItem
      })

      setItems(transformedData)
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...items]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.provider_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    setFilteredItems(filtered)
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await approveAction(id)
      await fetchItems()
    } catch (error) {
      console.error("Error approving:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    try {
      await rejectAction(id)
      await fetchItems()
    } catch (error) {
      console.error("Error rejecting:", error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchItems}
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
              placeholder="Search by name, location, or owner..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items found</div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.images && item.images[0] && (
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <Image
                          src={item.images[0]}
                          alt={item.name || "Item image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name || "Unnamed"}</h3>
                        {item.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.location}</span>
                          </div>
                        )}
                        {item.provider_name && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <User className="h-4 w-4" />
                            <span>Owner: {item.provider_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={
                            item.status === "approved"
                              ? "bg-emerald-600"
                              : item.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }
                        >
                          {String(item.status || "pending")}
                        </Badge>
                        {item.price_per_night_rwf && (
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(item.price_per_night_rwf)}
                            /night
                          </Badge>
                        )}
                        {item.price_per_person_rwf && (
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(item.price_per_person_rwf)}
                            /person
                          </Badge>
                        )}
                        {item.price_per_day_rwf && (
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(item.price_per_day_rwf)}
                            /day
                          </Badge>
                        )}
                        {item.average_price_rwf && (
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(item.average_price_rwf)}
                            /meal
                          </Badge>
                        )}
                        {item.price_per_trip_rwf && (
                          <Badge variant="outline">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(item.price_per_trip_rwf)}
                            /trip
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleApprove(item.id)}
                            disabled={processingId === item.id}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(item.id)}
                            disabled={processingId === item.id}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {item.status === "rejected" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(item.id)}
                          disabled={processingId === item.id}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

