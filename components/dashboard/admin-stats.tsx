"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Hotel, Compass, Mountain, Utensils, Truck, Car } from "lucide-react"
import { AdminUsersDialog } from "./admin-users-dialog"
import { AdminApproveDialog } from "./admin-approve-dialog"
import {
  approveHotel,
  rejectHotel,
  approveTour,
  rejectTour,
  approveRestaurant,
  rejectRestaurant,
  approveCarRental,
  rejectCarRental,
  approveTransportService,
  rejectTransportService,
  approveAttraction,
  rejectAttraction,
} from "@/app/admin/actions"

interface AdminStatsProps {
  totalUsers: number
  totalHotels: number
  totalTours: number
  totalAttractions: number
  totalRestaurants: number
  totalTransportServices: number
  totalCarRentals: number
}

export function AdminStats({
  totalUsers,
  totalHotels,
  totalTours,
  totalAttractions,
  totalRestaurants,
  totalTransportServices,
  totalCarRentals,
}: AdminStatsProps) {
  const [usersOpen, setUsersOpen] = useState(false)
  const [hotelsOpen, setHotelsOpen] = useState(false)
  const [toursOpen, setToursOpen] = useState(false)
  const [attractionsOpen, setAttractionsOpen] = useState(false)
  const [restaurantsOpen, setRestaurantsOpen] = useState(false)
  const [transportOpen, setTransportOpen] = useState(false)
  const [carRentalsOpen, setCarRentalsOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setUsersOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <Users className="h-10 w-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setHotelsOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hotels</p>
                <p className="text-3xl font-bold text-blue-600">{totalHotels}</p>
              </div>
              <Hotel className="h-10 w-10 text-blue-400" />
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
                <p className="text-sm text-gray-600 mb-1">Tours</p>
                <p className="text-3xl font-bold text-amber-600">{totalTours}</p>
              </div>
              <Compass className="h-10 w-10 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setAttractionsOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attractions</p>
                <p className="text-3xl font-bold text-emerald-600">{totalAttractions}</p>
              </div>
              <Mountain className="h-10 w-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setRestaurantsOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Restaurants</p>
                <p className="text-3xl font-bold text-amber-600">{totalRestaurants}</p>
              </div>
              <Utensils className="h-10 w-10 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setTransportOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transport Services</p>
                <p className="text-3xl font-bold text-emerald-600">{totalTransportServices}</p>
              </div>
              <Truck className="h-10 w-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setCarRentalsOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Car Rentals</p>
                <p className="text-3xl font-bold text-blue-600">{totalCarRentals}</p>
              </div>
              <Car className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminUsersDialog open={usersOpen} onOpenChange={setUsersOpen} />
      <AdminApproveDialog
        open={hotelsOpen}
        onOpenChange={setHotelsOpen}
        tableName="hotels"
        title="All Hotels"
        description="View and manage all hotels. Approve or reject pending entries."
        approveAction={approveHotel}
        rejectAction={rejectHotel}
      />
      <AdminApproveDialog
        open={toursOpen}
        onOpenChange={setToursOpen}
        tableName="tours"
        title="All Tours"
        description="View and manage all tours. Approve or reject pending entries."
        approveAction={approveTour}
        rejectAction={rejectTour}
      />
      <AdminApproveDialog
        open={attractionsOpen}
        onOpenChange={setAttractionsOpen}
        tableName="attractions"
        title="All Attractions"
        description="View and manage all attractions."
        approveAction={approveAttraction}
        rejectAction={rejectAttraction}
      />
      <AdminApproveDialog
        open={restaurantsOpen}
        onOpenChange={setRestaurantsOpen}
        tableName="restaurants"
        title="All Restaurants"
        description="View and manage all restaurants. Approve or reject pending entries."
        approveAction={approveRestaurant}
        rejectAction={rejectRestaurant}
      />
      <AdminApproveDialog
        open={transportOpen}
        onOpenChange={setTransportOpen}
        tableName="transport_services"
        title="All Transport Services"
        description="View and manage all transport services. Approve or reject pending entries."
        approveAction={approveTransportService}
        rejectAction={rejectTransportService}
      />
      <AdminApproveDialog
        open={carRentalsOpen}
        onOpenChange={setCarRentalsOpen}
        tableName="car_rentals"
        title="All Car Rentals"
        description="View and manage all car rentals. Approve or reject pending entries."
        approveAction={approveCarRental}
        rejectAction={rejectCarRental}
      />
    </>
  )
}

