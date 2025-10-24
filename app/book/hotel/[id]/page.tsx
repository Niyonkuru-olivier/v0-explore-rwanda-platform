"use client"

import type React from "react"

import { useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "lucide-react"
import { createCheckoutSession } from "@/app/actions/stripe"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function BookHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const secret = await createCheckoutSession("hotel", id, checkInDate, checkOutDate, numberOfGuests, specialRequests)

    setClientSecret(secret!)
    setShowCheckout(true)
  }

  if (showCheckout && clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Complete Your Booking</h1>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Book Your Hotel Stay</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out Date</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(Number.parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special requirements or requests..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Proceed to Payment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
