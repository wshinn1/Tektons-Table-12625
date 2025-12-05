"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CampaignStatsCards } from "./campaign-stats-cards"
import { CampaignDonationChart } from "./campaign-donation-chart"
import { CampaignTopDonors } from "./campaign-top-donors"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Campaign {
  id: string
  title: string
  goal_amount: number
  current_amount: number
  status: string
  show_donor_list: boolean
}

interface Donation {
  id: string
  amount: number
  created_at: string
  campaign_id: string
  donation: {
    id: string
    amount: number
    is_recurring: boolean
    created_at: string
    supporter: {
      id: string
      full_name: string | null
      email: string
    }
  }
}

interface Props {
  campaign: Campaign
  donations: Donation[]
  subdomain: string
}

export function CampaignAnalyticsDashboard({ campaign, donations, subdomain }: Props) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)

    // Create CSV headers
    const headers = ["Date", "Donor Name", "Email", "Amount", "Type", "Campaign"]

    // Create CSV rows
    const rows = donations.map((d) => [
      new Date(d.donation.created_at).toLocaleDateString(),
      campaign.show_donor_list ? d.donation.supporter?.full_name || "Anonymous" : "Anonymous",
      campaign.show_donor_list ? d.donation.supporter?.email || "" : "",
      `$${Number(d.donation.amount).toFixed(2)}`,
      d.donation.is_recurring ? "Recurring" : "One-time",
      campaign.title,
    ])

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${campaign.title.toLowerCase().replace(/\s+/g, "-")}-donations-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setIsExporting(false)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin/campaigns">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{campaign.title} Analytics</h1>
          <p className="text-muted-foreground">Campaign performance metrics and donor insights</p>
        </div>
        <Button onClick={exportToCSV} disabled={isExporting || donations.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Stats Cards */}
      <CampaignStatsCards campaign={campaign} donations={donations} />

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donors">Top Donors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CampaignDonationChart donations={donations} />

          {/* Donation Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Latest contributions to this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No donations yet</p>
                  <p className="text-sm">Donations will appear here once supporters contribute to this campaign.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 10).map((donation) => (
                    <div key={donation.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">
                          {campaign.show_donor_list
                            ? donation.donation.supporter?.full_name || "Anonymous"
                            : "Anonymous"}
                        </p>
                        {campaign.show_donor_list && (
                          <p className="text-sm text-muted-foreground">{donation.donation.supporter?.email}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${Number(donation.donation.amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(donation.donation.created_at).toLocaleDateString()}
                          {donation.donation.is_recurring && <span className="ml-2 text-purple-600">(Recurring)</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donors" className="space-y-4">
          <CampaignTopDonors donations={donations} showDonorList={campaign.show_donor_list} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
