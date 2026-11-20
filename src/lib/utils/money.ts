const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Integer cents → "$1,234.56". */
export function formatUsdCents(cents: number): string {
  return usd.format(cents / 100)
}
