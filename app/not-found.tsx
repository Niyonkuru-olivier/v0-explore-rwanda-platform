import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-blue-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">404</CardTitle>
          <CardDescription className="text-center text-lg">Page not found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/attractions">
              <Search className="mr-2 h-4 w-4" />
              Explore
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
