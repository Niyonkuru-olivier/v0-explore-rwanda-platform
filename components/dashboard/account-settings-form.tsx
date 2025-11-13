"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface AccountSettingsFormProps {
  initialData: {
    id: string
    fullName: string
    email: string
    phone: string | null
    role: string
  }
}

export default function AccountSettingsForm({ initialData }: AccountSettingsFormProps) {
  const [fullName, setFullName] = useState(initialData.fullName)
  const [email, setEmail] = useState(initialData.email)
  const [phone, setPhone] = useState(initialData.phone ?? "")
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

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email,
          phone: phone || null,
        })
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
      router.refresh()
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? "Saving changes..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

