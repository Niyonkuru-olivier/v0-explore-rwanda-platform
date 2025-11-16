"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Car } from "lucide-react"
import { VehiclesDialog } from "./vehicles-dialog"

interface CarRentalStatsProps {
  totalVehicles: number
  pendingVehicles: number
  approvedVehicles: number
}

export function CarRentalStats({
  totalVehicles,
  pendingVehicles,
  approvedVehicles,
}: CarRentalStatsProps) {
  const [allVehiclesOpen, setAllVehiclesOpen] = useState(false)
  const [pendingVehiclesOpen, setPendingVehiclesOpen] = useState(false)
  const [approvedVehiclesOpen, setApprovedVehiclesOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setAllVehiclesOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
                <p className="text-3xl font-bold text-blue-600">{totalVehicles}</p>
              </div>
              <Car className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setPendingVehiclesOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Vehicles</p>
                <p className="text-3xl font-bold text-amber-600">{pendingVehicles}</p>
              </div>
              <Car className="h-10 w-10 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setApprovedVehiclesOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved Vehicles</p>
                <p className="text-3xl font-bold text-emerald-600">{approvedVehicles}</p>
              </div>
              <Car className="h-10 w-10 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <VehiclesDialog open={allVehiclesOpen} onOpenChange={setAllVehiclesOpen} statusFilter="all" />
      <VehiclesDialog
        open={pendingVehiclesOpen}
        onOpenChange={setPendingVehiclesOpen}
        statusFilter="pending"
      />
      <VehiclesDialog
        open={approvedVehiclesOpen}
        onOpenChange={setApprovedVehiclesOpen}
        statusFilter="approved"
      />
    </>
  )
}

