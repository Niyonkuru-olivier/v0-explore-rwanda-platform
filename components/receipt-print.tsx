"use client"

import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { useRef } from "react"

interface ReceiptPrintProps {
  bookingId: string
  bookingType: string
  itemName: string
  customerName: string
  customerEmail: string
  totalAmount: number
  bookingDate: string
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  specialRequests?: string
}

export function ReceiptPrint({
  bookingId,
  bookingType,
  itemName,
  customerName,
  customerEmail,
  totalAmount,
  bookingDate,
  checkInDate,
  checkOutDate,
  guests,
  specialRequests,
}: ReceiptPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a printable version
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open("", "", "width=800,height=600")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${bookingId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #059669; }
            .receipt-title { font-size: 20px; margin-top: 10px; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { color: #6b7280; }
            .value { font-weight: 600; }
            .total { font-size: 24px; color: #059669; font-weight: bold; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <>
      <div className="flex gap-2 mb-6 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex-1 bg-transparent">
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div ref={printRef} className="hidden print:block">
        <div className="header">
          <div className="logo">Explore Rwanda</div>
          <div className="receipt-title">Booking Receipt</div>
        </div>

        <div className="section">
          <h3>Booking Information</h3>
          <div className="row">
            <span className="label">Booking ID:</span>
            <span className="value">{bookingId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="row">
            <span className="label">Type:</span>
            <span className="value">{bookingType}</span>
          </div>
          <div className="row">
            <span className="label">Item:</span>
            <span className="value">{itemName}</span>
          </div>
        </div>

        <div className="section">
          <h3>Customer Details</h3>
          <div className="row">
            <span className="label">Name:</span>
            <span className="value">{customerName}</span>
          </div>
          <div className="row">
            <span className="label">Email:</span>
            <span className="value">{customerEmail}</span>
          </div>
        </div>

        {(checkInDate || guests) && (
          <div className="section">
            <h3>Booking Details</h3>
            {checkInDate && (
              <div className="row">
                <span className="label">Check-in:</span>
                <span className="value">{new Date(checkInDate).toLocaleDateString()}</span>
              </div>
            )}
            {checkOutDate && (
              <div className="row">
                <span className="label">Check-out:</span>
                <span className="value">{new Date(checkOutDate).toLocaleDateString()}</span>
              </div>
            )}
            {guests && (
              <div className="row">
                <span className="label">Guests:</span>
                <span className="value">{guests}</span>
              </div>
            )}
          </div>
        )}

        {specialRequests && (
          <div className="section">
            <h3>Special Requests</h3>
            <p>{specialRequests}</p>
          </div>
        )}

        <div className="section">
          <div className="row">
            <span className="label">Total Amount Paid:</span>
            <span className="total">
              {new Intl.NumberFormat("en-RW", {
                style: "currency",
                currency: "RWF",
                minimumFractionDigits: 0,
              }).format(totalAmount)}
            </span>
          </div>
          <div className="row">
            <span className="label">Booking Date:</span>
            <span className="value">{new Date(bookingDate).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </>
  )
}
