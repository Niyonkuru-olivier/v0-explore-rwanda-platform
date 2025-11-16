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
import { Plus, X, Utensils } from "lucide-react"

export default function NewRestaurantPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    cuisine_type: "",
    average_price_rwf: 0,
    phone: "",
    email: "",
    opening_hours: "",
  })

  const [amenities, setAmenities] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity))
  }

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

      const { error: insertError } = await supabase.from("restaurants").insert({
        provider_id: user.id,
        name: formData.name,
        description: formData.description || null,
        location: formData.location,
        cuisine_type: formData.cuisine_type || null,
        average_price_rwf: formData.average_price_rwf || 0,
        phone: formData.phone || null,
        email: formData.email || null,
        opening_hours: formData.opening_hours || null,
        amenities: amenities.length > 0 ? amenities : [],
        images: ["/placeholder.svg?height=400&width=600"],
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/dashboard/provider/restaurant")
    } catch (err: any) {
      setError(err.message || "Failed to create restaurant")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Utensils className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl text-amber-900">Add New Restaurant</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kigali Fine Dining"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your restaurant, menu highlights, ambiance..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Kigali City, Rwanda"
                  />
                </div>

                <div>
                  <Label htmlFor="cuisine_type">Cuisine Type</Label>
                  <Select
                    value={formData.cuisine_type}
                    onValueChange={(value) => setFormData({ ...formData, cuisine_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rwandan">Rwandan</SelectItem>
                      <SelectItem value="continental">Continental</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="fusion">Fusion</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Average Price per Meal (RWF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    required
                    value={formData.average_price_rwf || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, average_price_rwf: value })
                    }}
                    placeholder="15000"
                  />
                </div>

                <div>
                  <Label htmlFor="opening_hours">Opening Hours</Label>
                  <Input
                    id="opening_hours"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    placeholder="e.g., Mon-Sun: 8:00 AM - 10:00 PM"
                  />
                </div>
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
                    placeholder="contact@restaurant.com"
                  />
                </div>
              </div>

              <div>
                <Label>Amenities & Features</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="e.g., WiFi, Parking, Outdoor Seating, Live Music"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddAmenity()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddAmenity} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                      <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Restaurant"}
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

