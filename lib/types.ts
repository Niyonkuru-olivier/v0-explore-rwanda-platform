export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: "tourist" | "provider" | "admin"
  provider_type: "hotel" | "tour_guide" | "car_rental" | "restaurant" | "transport" | null
  created_at: string
  updated_at: string
}

export interface Attraction {
  id: string
  name: string
  description: string
  category: "wildlife" | "nature" | "culture" | "adventure"
  location: string
  latitude: number | null
  longitude: number | null
  entry_fee_rwf: number
  images: string[]
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Hotel {
  id: string
  provider_id: string | null
  name: string
  description: string
  location: string
  latitude: number | null
  longitude: number | null
  star_rating: number | null
  amenities: string[]
  images: string[]
  price_per_night_rwf: number
  available_rooms: number
  featured: boolean
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface Tour {
  id: string
  provider_id: string | null
  name: string
  description: string
  duration_days: number
  max_participants: number
  price_per_person_rwf: number
  included_services: string[]
  itinerary: any
  images: string[]
  featured: boolean
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  booking_type: "hotel" | "tour" | "attraction"
  reference_id: string
  check_in_date: string | null
  check_out_date: string | null
  number_of_guests: number
  total_amount_rwf: number
  payment_status: "pending" | "completed" | "failed" | "refunded"
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  booking_status: "pending" | "confirmed" | "cancelled" | "completed"
  special_requests: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  booking_id: string | null
  rating: number
  comment: string | null
  created_at: string
}
