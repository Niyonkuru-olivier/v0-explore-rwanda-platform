export interface BookingProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  type: "hotel" | "tour" | "attraction"
  referenceId: string
  metadata?: {
    checkInDate?: string
    checkOutDate?: string
    numberOfGuests?: number
    duration?: number
  }
}

export function createBookingProduct(
  type: "hotel" | "tour" | "attraction",
  item: any,
  metadata: {
    checkInDate?: string
    checkOutDate?: string
    numberOfGuests?: number
  },
): BookingProduct {
  let priceInCents = 0
  const name = item.name
  let description = item.description

  if (type === "hotel") {
    // Calculate total price for hotel stay
    const nights =
      metadata.checkInDate && metadata.checkOutDate
        ? Math.ceil(
            (new Date(metadata.checkOutDate).getTime() - new Date(metadata.checkInDate).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 1
    priceInCents = item.price_per_night_rwf * nights
    description = `${nights} night(s) stay`
  } else if (type === "tour") {
    priceInCents = item.price_per_person_rwf * (metadata.numberOfGuests || 1)
    description = `${item.duration_days} day tour for ${metadata.numberOfGuests || 1} guest(s)`
  } else if (type === "attraction") {
    priceInCents = item.entry_fee_rwf * (metadata.numberOfGuests || 1)
    description = `Entry for ${metadata.numberOfGuests || 1} guest(s)`
  }

  return {
    id: `${type}-${item.id}`,
    name,
    description,
    priceInCents,
    type,
    referenceId: item.id,
    metadata: {
      ...metadata,
      duration: type === "tour" ? item.duration_days : undefined,
    },
  }
}
