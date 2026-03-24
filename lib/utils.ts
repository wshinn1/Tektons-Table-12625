import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100)
}

/**
 * Compare two email addresses case-insensitively
 * This is important for tenant ownership checks since email providers
 * treat emails as case-insensitive (RFC 5321)
 */
export function emailsMatch(email1?: string | null, email2?: string | null): boolean {
  if (!email1 || !email2) return false
  return email1.toLowerCase().trim() === email2.toLowerCase().trim()
}
