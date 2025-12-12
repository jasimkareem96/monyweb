import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function calculateFees(
  grossIn: number,
  paypalFeeRate: number = 0.029
): {
  paypalFeeIn: number
  netIn: number
  platformFee: number
  merchantReceivable: number
  paypalFeeOut: number
  merchantNetFinal: number
} {
  // PayPal fee on receiving (2.9% + $0.30)
  const paypalFeeIn = grossIn * paypalFeeRate + 0.30
  const netIn = grossIn - paypalFeeIn

  // Platform fee (1%)
  const platformFee = netIn * 0.01
  const merchantReceivable = netIn - platformFee

  // PayPal fee on sending (2.9% + $0.30)
  const paypalFeeOut = merchantReceivable * paypalFeeRate + 0.30
  const merchantNetFinal = merchantReceivable - paypalFeeOut

  return {
    paypalFeeIn,
    netIn,
    platformFee,
    merchantReceivable,
    paypalFeeOut,
    merchantNetFinal,
  }
}

