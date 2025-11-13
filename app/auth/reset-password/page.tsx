"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function extractParamFromHash(hash: string, key: string) {
  if (!hash) return null
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""))
  return hashParams.get(key)
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  const searchParams = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), [])
  const urlHash = typeof window !== "undefined" ? window.location.hash : ""

  useEffect(() => {
    const supabase = createClient()

    // 1) Let Supabase auto-detect and set the session from the URL hash (default behavior).
    // 2) Also listen for auth state changes so we know when it's ready.
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
        setSessionReady(true)
        // Clean sensitive params from the URL
        if (typeof window !== "undefined") {
          const cleanUrl = new URL(window.location.href)
          cleanUrl.search = ""
          cleanUrl.hash = ""
          window.history.replaceState({}, document.title, cleanUrl.toString())
        }
      }
    })

    // 3) Fallback: if we have a `code` param, exchange it for a session explicitly
    const code =
      searchParams.get("code") ??
      searchParams.get("token") ??
      extractParamFromHash(urlHash, "code") ??
      extractParamFromHash(urlHash, "token")

    if (code) {
      ;(async () => {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
          setSessionReady(true)
          // Clean URL after success
          if (typeof window !== "undefined") {
            const cleanUrl = new URL(window.location.href)
            cleanUrl.search = ""
            cleanUrl.hash = ""
            window.history.replaceState({}, document.title, cleanUrl.toString())
          }
        } catch (sessionError) {
          const message =
            sessionError instanceof Error
              ? sessionError.message
              : "We couldn’t validate this reset link. Please request a new one."
          setError(message)
        }
      })()
    }

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [searchParams, urlHash])

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        throw updateError
      }

      router.replace("/auth/login?reset=success")
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-blue-50 to-amber-50">
      <div className="w-full max-w-sm">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">Reset password</CardTitle>
            <CardDescription>Choose a new password to secure your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {!sessionReady ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {error
                    ? error
                    : "Validating your reset link. If nothing happens after a few seconds, request a new password reset email."}
                </p>
                {error && (
                  <Button asChild variant="outline" className="w-full">
                    <a href="/auth/forgot-password">Request new reset link</a>
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleReset}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter a secure password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                    {isLoading ? "Updating password..." : "Update password"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

