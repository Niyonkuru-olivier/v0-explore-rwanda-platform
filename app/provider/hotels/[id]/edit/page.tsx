"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"

export default function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    star_rating: 3,
    price_per_night_rwf: 0,
    available_rooms: 0,
  })

  const [amenities, setAmenities] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotel = async () => {
      const { data: hotel } = await supabase.from("hotels").select("*").eq("id", id).single()

      if (hotel) {
        setFormData({
          name: hotel.name,
          description: hotel.description,
          location: hotel.location,
          star_rating: hotel.star_rating || 3,
          price_per_night_rwf: hotel.price_per_night_rwf,
          available_rooms: hotel.available_rooms,
        })
        setAmenities(hotel.amenities || [])
      }
      setIsLoading(false)
    }

    fetchHotel()
  }, [id])

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
      const { error: updateError } = await supabase
        .from("hotels")
        .update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          star_rating: formData.star_rating,
          price_per_night_rwf: formData.price_per_night_rwf,
          available_rooms: formData.available_rooms,
          amenities: amenities,
        })
        .eq("id", id)

      if (updateError) throw updateError

      router.push("/provider")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Edit Hotel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Hotel Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  />
                </div>

                <div>
                  <Label htmlFor="star_rating">Star Rating *</Label>
                  <Input
                    id="star_rating"
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={formData.star_rating}
                    onChange={(e) => setFormData({ ...formData, star_rating: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price per Night (RWF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    required
                    value={formData.price_per_night_rwf}
                    onChange={(e) => setFormData({ ...formData, price_per_night_rwf: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="rooms">Available Rooms *</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="0"
                    required
                    value={formData.available_rooms}
                    onChange={(e) => setFormData({ ...formData, available_rooms: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Amenities</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add amenity"
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
                      className="flex items-center gap-1 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm"
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
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
