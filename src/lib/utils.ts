import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  UZS: { symbol: 'UZS', name: "So'm" },
} as const

export type Currency = keyof typeof CURRENCIES

export const EXCHANGE_RATES = {
  USD_TO_UZS: 12500,
  UZS_TO_USD: 1 / 12500,
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
): number {
  if (fromCurrency === toCurrency) return amount

  if (fromCurrency === 'USD' && toCurrency === 'UZS') {
    return amount * EXCHANGE_RATES.USD_TO_UZS
  }

  if (fromCurrency === 'UZS' && toCurrency === 'USD') {
    return amount * EXCHANGE_RATES.UZS_TO_USD
  }

  return amount
}

export function formatCurrency(amount: number, currency: Currency): string {
  const { symbol } = CURRENCIES[currency]

  if (currency === 'UZS') {
    return `${amount.toLocaleString('uz-UZ')} ${symbol}`
  }

  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
