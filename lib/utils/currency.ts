export function formatRWF(amount: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function rwfToCents(rwf: number): number {
  // Stripe uses cents, 1 RWF = 1 cent for simplicity
  return Math.round(rwf)
}
