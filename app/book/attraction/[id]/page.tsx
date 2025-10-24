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
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function BookAttractionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [visitDate, setVisitDate] = useState("")
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const secret = await createCheckoutSession("attraction", id, visitDate, undefined, numberOfGuests, specialRequests)

    setClientSecret(secret!)
    setShowCheckout(true)
  }

  if (showCheckout && clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-emerald-900 mb-8 text-center">Complete Your Booking</h1>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">Book Your Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input
                  id="visitDate"
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <Label htmlFor="guests">Number of Visitors</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(Number.parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special requirements..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
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
