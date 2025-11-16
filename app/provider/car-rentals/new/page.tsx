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
import { Car } from "lucide-react"

export default function NewCarRentalPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_name: "",
    location: "",
    vehicle_type: "",
    seats: 0,
    price_per_day_rwf: 0,
    number_of_vehicles: 0,
    vehicle_capacity: 0,
    phone: "",
    email: "",
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

      const { error: insertError } = await supabase.from("car_rentals").insert({
        provider_id: user.id,
        name: formData.name,
        description: formData.description || null,
        company_name: formData.company_name || null,
        location: formData.location,
        vehicle_type: formData.vehicle_type || null,
        seats: formData.seats || null,
        price_per_day_rwf: formData.price_per_day_rwf || 0,
        number_of_vehicles: formData.number_of_vehicles || null,
        vehicle_capacity: formData.vehicle_capacity || null,
        phone: formData.phone || null,
        email: formData.email || null,
        images: ["/placeholder.svg?height=400&width=600"],
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/dashboard/provider/car-rental")
    } catch (err: any) {
      setError(err.message || "Failed to create car rental")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Car className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl text-blue-900">Add New Vehicle/Company</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g., Kigali Car Rentals"
                />
              </div>

              <div>
                <Label htmlFor="name">Vehicle Name/Model *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Toyota RAV4"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the vehicle, features, condition..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Select
                    value={formData.vehicle_type}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="pickup">Pickup Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="seats">Number of Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    value={formData.seats || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, seats: value })
                    }}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="number_of_vehicles">Number of Vehicles</Label>
                  <Input
                    id="number_of_vehicles"
                    type="number"
                    min="0"
                    value={formData.number_of_vehicles || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, number_of_vehicles: value })
                    }}
                    placeholder="10"
                  />
                </div>

                <div>
                  <Label htmlFor="vehicle_capacity">Vehicle Capacity</Label>
                  <Input
                    id="vehicle_capacity"
                    type="number"
                    min="0"
                    value={formData.vehicle_capacity || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, vehicle_capacity: value })
                    }}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Price per Day (RWF) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  required
                  value={formData.price_per_day_rwf || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                    setFormData({ ...formData, price_per_day_rwf: value })
                  }}
                  placeholder="50000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+250 788 123 456"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Vehicle/Company"}
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

