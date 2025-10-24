import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Explore Rwanda</h3>
            <p className="text-sm text-gray-400">
              Discover the land of a thousand hills. Experience wildlife, culture, and adventure.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/attractions" className="text-sm hover:text-emerald-400 transition-colors">
                  Attractions
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="text-sm hover:text-emerald-400 transition-colors">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/tours" className="text-sm hover:text-emerald-400 transition-colors">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-sm hover:text-emerald-400 transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-emerald-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                Kigali, Rwanda
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                +250 788 123 456
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                info@explorerwanda.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-400 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Explore Rwanda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
