export interface DonationTier {
  id: string
  name: string
  description: string
  amountInCents: number
  recurring: boolean
}

// Default donation tiers for missionaries
export const DEFAULT_DONATION_TIERS: DonationTier[] = [
  {
    id: "monthly-25",
    name: "Prayer Partner",
    description: "Join us in prayer and provide basic support",
    amountInCents: 2500, // $25
    recurring: true,
  },
  {
    id: "monthly-50",
    name: "Ministry Partner",
    description: "Help cover monthly ministry expenses",
    amountInCents: 5000, // $50
    recurring: true,
  },
  {
    id: "monthly-100",
    name: "Mission Partner",
    description: "Provide significant monthly support",
    amountInCents: 10000, // $100
    recurring: true,
  },
  {
    id: "monthly-250",
    name: "Champion Partner",
    description: "Be a major supporter of our mission",
    amountInCents: 25000, // $250
    recurring: true,
  },
  {
    id: "one-time-50",
    name: "One-Time Gift",
    description: "Make a single donation to support our work",
    amountInCents: 5000, // $50
    recurring: false,
  },
]

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100)
}
