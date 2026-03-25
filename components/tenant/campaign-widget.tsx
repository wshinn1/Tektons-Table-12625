"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/donation-tiers"
import { CampaignShareDialog } from "./campaign-share-dialog"

interface CampaignWidgetProps {
  campaign: {
    id: string
    title: string
    slug: string
    goal_amount: number
    current_amount: number
  }
  progressPercent: number
  donationCount: number
  subdomain: string
}

export function CampaignWidget({ campaign, progressPercent, donationCount, subdomain }: CampaignWidgetProps) {
  const [showShare, setShowShare] = useState(false)

  return (
    <>
      <Card className="overflow-hidden border-2 shadow-lg bg-white">
        <div className="p-6 space-y-6">
          {/* Circular progress indicator */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                {/* Progress circle - GREEN theme for campaigns */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercent / 100)}`}
                  className="text-green-600 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600">{Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>

          {/* Amount raised */}
          <div className="text-center space-y-1">
            <h3 className="text-3xl font-bold">{formatCurrency(campaign.current_amount * 100)} raised</h3>
            <p className="text-muted-foreground">
              {formatCurrency(campaign.goal_amount * 100)} goal · {donationCount}{" "}
              {donationCount === 1 ? "donation" : "donations"}
            </p>
          </div>

          {/* Action buttons with GREEN theme */}
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white">
              <Link href={`/${subdomain}/campaigns/${campaign.slug}/donate`}>Donate now</Link>
            </Button>
            <Button
              onClick={() => setShowShare(true)}
              size="lg"
              variant="secondary"
              className="w-full font-semibold bg-green-100 hover:bg-green-200 text-green-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Recent activity indicator */}
          {donationCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 rounded-lg p-3">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium text-sm">
                {donationCount} {donationCount === 1 ? "person" : "people"} just donated
              </span>
            </div>
          )}
        </div>
      </Card>

      <CampaignShareDialog open={showShare} onOpenChange={setShowShare} campaign={campaign} subdomain={subdomain} />
    </>
  )
}
