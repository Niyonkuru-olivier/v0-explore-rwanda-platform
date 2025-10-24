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

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_days: 1,
    max_participants: 10,
    price_per_person_rwf: 0,
  })

  const [includedServices, setIncludedServices] = useState<string[]>([])
  const [newService, setNewService] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTour = async () => {
      const { data: tour } = await supabase.from("tours").select("*").eq("id", id).single()

      if (tour) {
        setFormData({
          name: tour.name,
          description: tour.description,
          duration_days: tour.duration_days,
          max_participants: tour.max_participants,
          price_per_person_rwf: tour.price_per_person_rwf,
        })
        setIncludedServices(tour.included_services || [])
      }
      setIsLoading(false)
    }

    fetchTour()
  }, [id])

  const handleAddService = () => {
    if (newService.trim() && !includedServices.includes(newService.trim())) {
      setIncludedServices([...includedServices, newService.trim()])
      setNewService("")
    }
  }

  const handleRemoveService = (service: string) => {
    setIncludedServices(includedServices.filter((s) => s !== service))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("tours")
        .update({
          name: formData.name,
          description: formData.description,
          duration_days: formData.duration_days,
          max_participants: formData.max_participants,
          price_per_person_rwf: formData.price_per_person_rwf,
          included_services: includedServices,
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Edit Tour</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Tour Name *</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (Days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    required
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="max_participants">Max Participants *</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    required
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price per Person (RWF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    required
                    value={formData.price_per_person_rwf}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_person_rwf: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Included Services</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add service"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddService()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddService} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {includedServices.map((service) => (
                    <div
                      key={service}
                      className="flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm"
                    >
                      {service}
                      <button type="button" onClick={() => handleRemoveService(service)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
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
