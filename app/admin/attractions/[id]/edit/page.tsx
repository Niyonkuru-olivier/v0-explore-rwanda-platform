"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function EditAttractionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "wildlife" as "wildlife" | "nature" | "culture" | "adventure",
    location: "",
    entry_fee_rwf: 0,
    featured: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttraction = async () => {
      const { data: attraction } = await supabase.from("attractions").select("*").eq("id", id).single()

      if (attraction) {
        setFormData({
          name: attraction.name,
          description: attraction.description,
          category: attraction.category,
          location: attraction.location,
          entry_fee_rwf: attraction.entry_fee_rwf,
          featured: attraction.featured,
        })
      }
      setIsLoading(false)
    }

    fetchAttraction()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("attractions")
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          entry_fee_rwf: formData.entry_fee_rwf,
          featured: formData.featured,
        })
        .eq("id", id)

      if (updateError) throw updateError

      router.push("/admin/attractions")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">Edit Attraction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Attraction Name *</Label>
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
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wildlife">Wildlife</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="entry_fee">Entry Fee (RWF) *</Label>
                <Input
                  id="entry_fee"
                  type="number"
                  min="0"
                  required
                  value={formData.entry_fee_rwf}
                  onChange={(e) => setFormData({ ...formData, entry_fee_rwf: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                />
                <Label htmlFor="featured" className="font-normal">
                  Feature this attraction on the homepage
                </Label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
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
