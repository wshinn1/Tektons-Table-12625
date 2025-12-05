"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, Calendar, Percent } from "lucide-react"

interface Campaign {
  goal_amount: number
  current_amount: number
}

interface Donation {
  donation: {
    amount: number
    is_recurring: boolean
    supporter: {
      id: string
    }
  }
}

interface Props {
  campaign: Campaign
  donations: Donation[]
}

export function CampaignStatsCards({ campaign, donations }: Props) {
  const totalRaised = Number(campaign.current_amount) || 0
  const goalAmount = Number(campaign.goal_amount) || 1
  const percentageRaised = Math.min((totalRaised / goalAmount) * 100, 100)

  const donorCount = new Set(donations.map((d) => d.donation.supporter?.id).filter(Boolean)).size
  const donationCount = donations.length
  const averageDonation = donationCount > 0 ? totalRaised / donationCount : 0

  const recurringCount = donations.filter((d) => d.donation.is_recurring).length
  const recurringPercentage = donationCount > 0 ? (recurringCount / donationCount) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${totalRaised.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">of ${goalAmount.toFixed(2)} goal</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{percentageRaised.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">of goal achieved</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{donorCount}</div>
          <p className="text-xs text-muted-foreground">{donationCount} total donations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Donation</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${averageDonation.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">per donation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recurring</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{recurringCount}</div>
          <p className="text-xs text-muted-foreground">{recurringPercentage.toFixed(0)}% of donations</p>
        </CardContent>
      </Card>
    </div>
  )
}
