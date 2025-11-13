"use client"

import { useState } from "react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const supabase = createClient()

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        (typeof window !== "undefined" ? window.location.origin : "")

      if (!baseUrl) {
        throw new Error("Unable to determine site URL for password reset.")
      }

      const redirectTo = new URL("/auth/reset-password", baseUrl).toString()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) {
        throw resetError
      }

      setSuccess("If an account exists for this email, a password reset link has been sent.")
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We were unable to start the reset process. Please try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-blue-50 to-amber-50">
      <div className="w-full max-w-sm">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">Forgot password</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                {success && (
                  <p className="text-sm rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-700">
                    {success}
                  </p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? "Sending reset link..." : "Send reset link"}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Remembered your password?{" "}
              <Link href="/auth/login" className="underline underline-offset-4 text-emerald-600">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

