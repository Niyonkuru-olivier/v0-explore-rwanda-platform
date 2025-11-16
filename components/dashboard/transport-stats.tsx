"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Hotel, Compass, BookOpen, DollarSign, TrendingUp } from "lucide-react"
import { HotelsDialog } from "./hotels-dialog"
import { ToursDialog } from "./tours-dialog"
import { BookingsDialog } from "./bookings-dialog"

interface TransportStatsProps {
  totalHotels: number
  totalTours: number
  totalBookings: number
  totalRevenue: number
}

export function TransportStats({
  totalHotels,
  totalTours,
  totalBookings,
  totalRevenue,
}: TransportStatsProps) {
  const [hotelsOpen, setHotelsOpen] = useState(false)
  const [toursOpen, setToursOpen] = useState(false)
  const [bookingsOpen, setBookingsOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setHotelsOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hotels</p>
                <p className="text-3xl font-bold text-blue-600">{totalHotels}</p>
              </div>
              <Hotel className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setToursOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tours</p>
                <p className="text-3xl font-bold text-amber-600">{totalTours}</p>
              </div>
              <Compass className="h-10 w-10 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setBookingsOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-emerald-600">{totalBookings}</p>
              </div>
              <BookOpen className="h-10 w-10 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    minimumFractionDigits: 0,
                  }).format(totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <HotelsDialog open={hotelsOpen} onOpenChange={setHotelsOpen} />
      <ToursDialog open={toursOpen} onOpenChange={setToursOpen} />
      <BookingsDialog open={bookingsOpen} onOpenChange={setBookingsOpen} />
    </>
  )
}

