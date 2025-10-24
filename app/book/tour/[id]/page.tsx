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

export default function BookTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [startDate, setStartDate] = useState("")
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const secret = await createCheckoutSession("tour", id, startDate, undefined, numberOfGuests, specialRequests)

    setClientSecret(secret!)
    setShowCheckout(true)
  }

  if (showCheckout && clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-amber-900 mb-8 text-center">Complete Your Booking</h1>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Book Your Tour</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="startDate">Tour Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <Label htmlFor="guests">Number of Participants</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(Number.parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Dietary restrictions, accessibility needs, etc..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
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
