export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

export function validateDateRange(checkIn: string, checkOut: string): boolean {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return checkInDate >= today && checkOutDate > checkInDate
}

export function validateGuests(guests: number, maxGuests?: number): boolean {
  if (guests < 1) return false
  if (maxGuests && guests > maxGuests) return false
  return true
}
