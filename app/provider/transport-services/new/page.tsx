"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Truck } from "lucide-react"

export default function NewTransportServicePage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    origin: "",
    destination: "",
    location: "",
    service_type: "",
    price_per_trip_rwf: 0,
    number_of_vehicles: 0,
    vehicle_capacity: 0,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { error: insertError } = await supabase.from("transport_services").insert({
        provider_id: user.id,
        name: formData.name,
        description: formData.description || null,
        origin: formData.origin || null,
        destination: formData.destination || null,
        location: formData.location || null,
        service_type: formData.service_type || null,
        price_per_trip_rwf: formData.price_per_trip_rwf || 0,
        number_of_vehicles: formData.number_of_vehicles || null,
        vehicle_capacity: formData.vehicle_capacity || null,
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/dashboard/provider/transport")
    } catch (err: any) {
      setError(err.message || "Failed to create transport service")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-emerald-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Truck className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Add New Transport Company/Service</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Company/Service Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kigali Express Transport"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your transport service..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="e.g., Kigali"
                  />
                </div>

                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g., Musanze"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location/Place *</Label>
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kigali City, Rwanda"
                />
              </div>

              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="taxi">Taxi</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="car_rental">Car Rental</SelectItem>
                    <SelectItem value="shuttle">Shuttle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price per Trip (RWF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    required
                    value={formData.price_per_trip_rwf || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, price_per_trip_rwf: value })
                    }}
                    placeholder="5000"
                  />
                </div>

                <div>
                  <Label htmlFor="vehicles">Number of Vehicles</Label>
                  <Input
                    id="vehicles"
                    type="number"
                    min="0"
                    value={formData.number_of_vehicles || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, number_of_vehicles: value })
                    }}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Vehicle Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.vehicle_capacity || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, vehicle_capacity: value })
                    }}
                    placeholder="14"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Transport Service"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

