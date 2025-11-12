"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(data)
      } else {
        // Clear profile if no user
        setProfile(null)
      }
    }
    
    getUser()

    // Listen for auth state changes (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Fetch profile when user signs in
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        // Clear user and profile on sign out
        setUser(null)
        setProfile(null)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Sign out error:", error)
      }
      
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      
      // Use hard redirect to ensure complete logout and clear any cached data
      // This ensures the user is completely logged out and can login/create account again
      window.location.href = "/"
    } catch (error) {
      console.error("Error during sign out:", error)
      // Even if there's an error, try to redirect
      window.location.href = "/"
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-600">Explore Rwanda</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/attractions"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Attractions
            </Link>
            <Link href="/hotels" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
              Hotels
            </Link>
            <Link href="/tours" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
              Tours
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Contact
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <User className="h-4 w-4" />
                    {profile?.full_name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  {profile?.role === "provider" && (
                    <DropdownMenuItem asChild>
                      <Link href="/provider">Provider Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              href="/attractions"
              className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              Attractions
            </Link>
            <Link
              href="/hotels"
              className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              Hotels
            </Link>
            <Link
              href="/tours"
              className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              Tours
            </Link>
            <Link
              href="/about"
              className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  href="/bookings"
                  className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
                  onClick={() => setIsOpen(false)}
                >
                  My Bookings
                </Link>
                {profile?.role === "provider" && (
                  <Link
                    href="/provider"
                    className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Provider Dashboard
                  </Link>
                )}
                {profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block text-sm font-medium text-gray-700 hover:text-emerald-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
