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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Search, Calendar, Users, DollarSign, User, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Booking {
  id: string
  user_id: string
  booking_type: "hotel" | "tour" | "attraction"
  reference_id: string
  check_in_date: string | null
  check_out_date: string | null
  number_of_guests: number
  total_amount_rwf: number
  payment_status: "pending" | "completed" | "failed" | "refunded"
  booking_status: "pending" | "confirmed" | "cancelled" | "completed"
  special_requests: string | null
  created_at: string
  itemDetails?: {
    name: string
    location?: string
  }
  userDetails?: {
    full_name: string
    email: string
  }
}

interface BookingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingsDialog({ open, onOpenChange }: BookingsDialogProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date_desc")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchBookings()
    }
  }, [open])

  useEffect(() => {
    filterAndSortBookings()
  }, [bookings, searchQuery, sortBy, paymentFilter, bookingStatusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Fetch related items and user details
      const bookingsWithDetails = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          let itemDetails = null
          let userDetails = null

          // Fetch item details
          if (booking.booking_type === "hotel") {
            const { data } = await supabase
              .from("hotels")
              .select("name, location")
              .eq("id", booking.reference_id)
              .single()
            itemDetails = data
          } else if (booking.booking_type === "tour") {
            const { data } = await supabase
              .from("tours")
              .select("name")
              .eq("id", booking.reference_id)
              .single()
            itemDetails = data
          } else if (booking.booking_type === "attraction") {
            const { data } = await supabase
              .from("attractions")
              .select("name, location")
              .eq("id", booking.reference_id)
              .single()
            itemDetails = data
          }

          // Fetch user details
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", booking.user_id)
            .single()
          userDetails = userData

          return { ...booking, itemDetails, userDetails }
        })
      )

      setBookings(bookingsWithDetails)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortBookings = () => {
    let filtered = [...bookings]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.itemDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.userDetails?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.userDetails?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Payment status filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((booking) => booking.payment_status === paymentFilter)
    }

    // Booking status filter
    if (bookingStatusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.booking_status === bookingStatusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "amount_desc":
          return b.total_amount_rwf - a.total_amount_rwf
        case "amount_asc":
          return a.total_amount_rwf - b.total_amount_rwf
        default:
          return 0
      }
    })

    setFilteredBookings(filtered)
  }

  const totalRevenue = filteredBookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + b.total_amount_rwf, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>All Bookings</DialogTitle>
              <DialogDescription>
                View and manage all bookings. Total Revenue:{" "}
                <span className="font-bold text-green-600">
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    minimumFractionDigits: 0,
                  }).format(totalRevenue)}
                </span>
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
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
              placeholder="Search by booking ID, user, or item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Booking status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Date (Newest)</SelectItem>
              <SelectItem value="date_asc">Date (Oldest)</SelectItem>
              <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
              <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-8">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No bookings found</div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {booking.itemDetails?.name || "Unknown Item"}
                        </h3>
                        <Badge variant="outline" className="capitalize">
                          {booking.booking_type}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {booking.userDetails?.full_name || "Unknown User"} (
                            {booking.userDetails?.email || "No email"})
                          </span>
                        </div>
                        {booking.check_in_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {booking.booking_type === "hotel"
                                ? `${new Date(booking.check_in_date).toLocaleDateString()} - ${booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : "N/A"}`
                                : new Date(booking.check_in_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{booking.number_of_guests} guest(s)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-emerald-600">
                            {new Intl.NumberFormat("en-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(booking.total_amount_rwf)}
                          </span>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <div className="text-sm">
                          <span className="font-semibold">Special Requests: </span>
                          <span className="text-gray-600">{booking.special_requests}</span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Booking ID: {booking.id} • Created:{" "}
                        {new Date(booking.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <Badge
                        className={
                          booking.payment_status === "completed"
                            ? "bg-emerald-600"
                            : booking.payment_status === "pending"
                              ? "bg-amber-500"
                              : booking.payment_status === "failed"
                                ? "bg-red-500"
                                : "bg-gray-500"
                        }
                      >
                        Payment: {booking.payment_status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="capitalize"
                      >
                        Status: {booking.booking_status}
                      </Badge>
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

