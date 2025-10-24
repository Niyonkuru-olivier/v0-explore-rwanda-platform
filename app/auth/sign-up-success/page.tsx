import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-blue-50 to-amber-50">
      <div className="w-full max-w-sm">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">Check your email</CardTitle>
            <CardDescription>Confirm your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;ve sent you a confirmation email. Please check your inbox and click the link to verify your
              account.
            </p>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
