"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Sign in the user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) throw signInError

      // Wait a moment for the session to be fully established
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Get the user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        throw new Error("Failed to get user information")
      }

      // Fetch profile with retry logic
      let profile = null
      let retries = 3
      
      while (retries > 0 && !profile) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which we'll handle
          console.error("Profile fetch error:", profileError)
        }

        if (data) {
          profile = data
          break
        }

        // If profile doesn't exist, wait a bit and retry (in case trigger is still processing)
        if (retries > 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        retries--
      }

      // If profile still doesn't exist, create it with default role
      if (!profile) {
        const userMetadata = user.user_metadata || {}
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || email,
            full_name: userMetadata.full_name || "",
            role: userMetadata.role || "tourist",
            phone: userMetadata.phone || null,
          })
          .select("role")
          .single()

        if (createError) {
          console.error("Failed to create profile:", createError)
          // Even if profile creation fails, try to proceed with default role
        } else if (newProfile) {
          profile = newProfile
        }
      }

      // Determine redirect path based on role
      let redirectPath = "/dashboard/tourist" // default

      if (profile && profile.role) {
        switch (profile.role) {
          case "admin":
            redirectPath = "/dashboard/admin"
            break
          case "provider":
            redirectPath = "/dashboard/provider"
            break
          case "tourist":
          default:
            redirectPath = "/dashboard/tourist"
            break
        }
      }

      // Use window.location for a hard redirect to ensure proper navigation
      window.location.href = redirectPath
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-blue-50 to-amber-50">
      <div className="w-full max-w-sm">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">Login</CardTitle>
            <CardDescription>Enter your email to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4 text-emerald-600">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
