"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { formatCurrency } from "@/lib/donation-tiers"
import { formatDistanceToNow } from "date-fns"

interface Donation {
  id: string
  amount: number
  donor_name: string | null
  is_anonymous: boolean
  created_at: string
}

interface CampaignDonationsFeedProps {
  donations: Donation[]
  allowAnonymous: boolean
  recentLimit: number
}

export function CampaignDonationsFeed({ donations, allowAnonymous, recentLimit }: CampaignDonationsFeedProps) {
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "top">("recent")

  // Sort donations
  const sortedDonations = [...donations].sort((a, b) => {
    if (sortBy === "top") {
      return b.amount - a.amount
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Limit displayed donations
  const displayedDonations = showAll ? sortedDonations : sortedDonations.slice(0, recentLimit)

  const getDonorName = (donation: Donation) => {
    if (donation.is_anonymous || !donation.donor_name) {
      return "Anonymous"
    }
    return donation.donor_name
  }

  const getTimeAgo = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: false })
    } catch {
      return "recently"
    }
  }

  return (
    <Card className="overflow-hidden border-2 shadow-lg bg-white">
      {/* Header with tabs */}
      <div className="border-b bg-muted/30 p-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Recent donations</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={sortBy === "recent" ? "default" : "ghost"}
            onClick={() => setSortBy("recent")}
            className="text-xs"
          >
            See all
          </Button>
          <Button
            size="sm"
            variant={sortBy === "top" ? "default" : "ghost"}
            onClick={() => setSortBy("top")}
            className="text-xs"
          >
            See top
          </Button>
        </div>
      </div>

      {/* Donations list */}
      <div className="max-h-96 overflow-y-auto">
        {displayedDonations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No donations yet. Be the first to support this campaign!</p>
          </div>
        ) : (
          <div className="divide-y">
            {displayedDonations.map((donation) => (
              <div key={donation.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                {/* Donor avatar */}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-green-600 fill-green-600" />
                </div>

                {/* Donor info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{getDonorName(donation)}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{formatCurrency(donation.amount * 100)}</span> ·{" "}
                    {getTimeAgo(donation.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show more button */}
      {!showAll && donations.length > recentLimit && (
        <div className="border-t p-4">
          <Button variant="ghost" size="sm" onClick={() => setShowAll(true)} className="w-full">
            Show all {donations.length} donations
          </Button>
        </div>
      )}
    </Card>
  )
}
