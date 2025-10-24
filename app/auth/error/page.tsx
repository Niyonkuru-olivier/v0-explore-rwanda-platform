import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-blue-50 to-amber-50">
      <div className="w-full max-w-sm">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl text-red-900">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            {params?.error ? (
              <p className="text-sm text-muted-foreground mb-4">Error: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">An authentication error occurred.</p>
            )}
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
