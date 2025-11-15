"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface AccountSettingsFormProps {
  initialData: {
    id: string
    fullName: string
    email: string
    phone: string | null
    role: string
    providerType: string | null
  }
}

const VALID_PROVIDER_TYPES = [
  { value: "hotel", label: "Hotel Owner" },
  { value: "tour_guide", label: "Tour Guide" },
  { value: "car_rental", label: "Car Rental Service" },
  { value: "restaurant", label: "Restaurant Owner" },
  { value: "transport", label: "Transport Service" },
] as const

export default function AccountSettingsForm({ initialData }: AccountSettingsFormProps) {
  const [fullName, setFullName] = useState(initialData.fullName)
  const [email, setEmail] = useState(initialData.email)
  const [phone, setPhone] = useState(initialData.phone ?? "")
  const [providerType, setProviderType] = useState(initialData.providerType ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const shouldUpdateEmail = email.trim() !== initialData.email.trim()

      const { error: updateUserError } = await supabase.auth.updateUser({
        email: shouldUpdateEmail ? email : undefined,
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      })

      if (updateUserError) {
        throw updateUserError
      }

      const updateData: {
        full_name: string
        email: string
        phone: string | null
        provider_type?: string | null
      } = {
        full_name: fullName,
        email,
        phone: phone || null,
      }

      // Only update provider_type if user is a provider
      if (initialData.role === "provider") {
        updateData.provider_type = providerType && providerType.trim() ? providerType.trim() : null
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", initialData.id)

      if (profileError) {
        throw profileError
      }

      toast({
        title: "Profile updated",
        description: shouldUpdateEmail
          ? "Your details have been updated. Please check your inbox to confirm the email change."
          : "Your account details have been updated successfully.",
      })
      
      // If provider_type was set and user is a provider, redirect to their dashboard
      if (initialData.role === "provider" && providerType && !initialData.providerType) {
        router.push("/dashboard/provider")
      } else {
        router.refresh()
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn’t save your changes. Please try again shortly.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="text-2xl text-emerald-900">Profile information</CardTitle>
        <CardDescription>Keep your details up to date so we can tailor your experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <p className="text-xs text-gray-500">
              Changing your email will trigger a new verification link for security.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+250 XXX XXX XXX"
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Badge className="w-fit bg-emerald-600 hover:bg-emerald-700">{initialData.role}</Badge>
            <p className="text-xs text-gray-500">Roles are managed by the Explore Rwanda team.</p>
          </div>
          
          {initialData.role === "provider" && (
            <div className="grid gap-2">
              <Label htmlFor="providerType">Provider Type *</Label>
              <Select value={providerType} onValueChange={setProviderType} required>
                <SelectTrigger id="providerType">
                  <SelectValue placeholder="Select your provider type" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_PROVIDER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!initialData.providerType && (
                <p className="text-xs text-amber-600">
                  ⚠️ Please select your provider type to access your dashboard.
                </p>
              )}
              <p className="text-xs text-gray-500">
                Select the type of service you provide. This determines which dashboard you&apos;ll see.
              </p>
            </div>
          )}
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? "Saving changes..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

