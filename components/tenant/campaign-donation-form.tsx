"use client"

import { useState } from "react"
import { DonationCheckout } from "@/components/tenant/donation-checkout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart } from "lucide-react"

interface CampaignDonationFormProps {
  tenantId: string
  campaignId: string
  campaignTitle: string
  suggestedAmounts: number[]
  feeModel: string
  suggestedTipPercent: number
  currentAmount: number
  goalAmount: number
}

export function CampaignDonationForm({
  tenantId,
  campaignId,
  campaignTitle,
  suggestedAmounts,
  feeModel,
  suggestedTipPercent,
  currentAmount,
  goalAmount,
}: CampaignDonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [donationType, setDonationType] = useState<"once" | "monthly">("once")
  const [showCheckout, setShowCheckout] = useState(false)

  const finalAmount = selectedAmount || (customAmount ? Number.parseFloat(customAmount) : 0)

  if (showCheckout && finalAmount > 0) {
    // Generate tier ID for checkout
    const tierId = `custom-${donationType}-${finalAmount}`

    return (
      <DonationCheckout
        tenantId={tenantId}
        tierId={tierId}
        tierAmount={finalAmount}
        feeModel={feeModel as any}
        suggestedTipPercent={suggestedTipPercent}
        campaignId={campaignId}
        campaignTitle={campaignTitle}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Campaign progress */}
      <Card className="bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle>Campaign Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">${currentAmount.toLocaleString()} raised</span>
              <span className="text-muted-foreground">${goalAmount.toLocaleString()} goal</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((currentAmount / goalAmount) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation form */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Donation</CardTitle>
          <CardDescription>Select an amount or enter a custom amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Donation type toggle */}
          <div>
            <Label className="mb-3 block">Donation Type</Label>
            <RadioGroup value={donationType} onValueChange={(value: any) => setDonationType(value)}>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${donationType === "once" ? "border-green-600 bg-green-50 dark:bg-green-950" : ""}`}
                  onClick={() => setDonationType("once")}
                >
                  <RadioGroupItem value="once" id="once" />
                  <Label htmlFor="once" className="cursor-pointer font-medium">
                    One-time
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${donationType === "monthly" ? "border-green-600 bg-green-50 dark:bg-green-950" : ""}`}
                  onClick={() => setDonationType("monthly")}
                >
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="cursor-pointer font-medium">
                    Monthly
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Amount selection */}
          <div>
            <Label className="mb-3 block">Select Amount</Label>
            <div className="grid grid-cols-3 gap-3">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={selectedAmount === amount ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount("")
                  }}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="custom-amount">Custom Amount</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl">$</span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                min={1}
                step={1}
              />
            </div>
          </div>

          {/* Continue button */}
          <Button
            onClick={() => setShowCheckout(true)}
            disabled={finalAmount <= 0}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Heart className="h-4 w-4 mr-2" />
            Continue to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
