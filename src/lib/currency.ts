export function formatUsdAmount(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value)
}

export function formatUsd(value: number, options: Intl.NumberFormatOptions = {}): string {
  return `$${formatUsdAmount(value, options)}`
}
