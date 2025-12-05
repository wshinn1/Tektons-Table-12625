"use client"

import { Trophy, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CampaignCompletionBannerProps {
  campaign: {
    title: string
    current_amount: number
    goal_amount: number
  }
  onShare?: () => void
}

export function CampaignCompletionBanner({ campaign, onShare }: CampaignCompletionBannerProps) {
  const percentComplete = (campaign.current_amount / campaign.goal_amount) * 100

  if (percentComplete < 100) return null

  return (
    <Card className="border-green-600 bg-green-50 dark:bg-green-950">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-1">Goal Reached! 🎉</h3>
            <p className="text-green-800 dark:text-green-200">
              This campaign has successfully raised{" "}
              <span className="font-bold">${campaign.current_amount.toLocaleString()}</span> of its{" "}
              <span className="font-bold">${campaign.goal_amount.toLocaleString()}</span> goal!
            </p>
          </div>
          {onShare && (
            <Button onClick={onShare} variant="outline" className="border-green-600 text-green-700 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share Success
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
