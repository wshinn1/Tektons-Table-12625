"use client"

import { useState } from "react"
import { startDonationCheckout } from "@/app/actions/stripe-donations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"

export function DonationCheckout({
  tenantId,
  tierId,
  donorEmail,
  feeModel = "donor_tips",
  suggestedTipPercent = 12,
  tierAmount,
  campaignId,
  campaignTitle,
}: {
  tenantId: string
  tierId: string
  donorEmail?: string
  feeModel?: "donor_tips" | "platform_fee"
  suggestedTipPercent?: number
  tierAmount: number
  campaignId?: string
  campaignTitle?: string
}) {
  const [tipOption, setTipOption] = useState<"suggested" | "custom">("suggested")
  const [customTipPercent, setCustomTipPercent] = useState(15)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiateCheckout = async () => {
    setIsProcessing(true)
    try {
      const tipAmount = calculateTip()
      const checkoutUrl = await startDonationCheckout(tenantId, tierId, donorEmail, tipAmount, campaignId)

      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        setError("Failed to create checkout session")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      setError("Failed to start checkout. Please try again.")
      setIsProcessing(false)
    }
  }

  const calculateTip = () => {
    if (feeModel === "platform_fee") return 0
    if (tipOption === "suggested") return Math.round(tierAmount * (suggestedTipPercent / 100) * 100) / 100
    return Math.round(tierAmount * (customTipPercent / 100) * 100) / 100
  }

  const tipAmount = calculateTip()
  const totalAmount = tierAmount + tipAmount

  if (isProcessing && !error) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-green-600" />
            <h2 className="text-xl font-semibold">Preparing your secure checkout...</h2>
            <p className="text-sm text-muted-foreground">You'll be redirected to Stripe in a moment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {campaignTitle && (
        <Card>
          <CardHeader>
            <CardTitle>Supporting: {campaignTitle}</CardTitle>
            <CardDescription>Your donation will go directly to this campaign</CardDescription>
          </CardHeader>
        </Card>
      )}

      {feeModel === "donor_tips" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Support the Platform (Optional)
            </CardTitle>
            <CardDescription>
              Help us keep the lights on! 100% of your donation goes to the missionary. Tips cover our costs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={tipOption} onValueChange={(value: any) => setTipOption(value)}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="suggested" id="suggested" />
                    <Label htmlFor="suggested" className="cursor-pointer">
                      {suggestedTipPercent}% tip (${Math.round(tierAmount * (suggestedTipPercent / 100) * 100) / 100})
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">Most common</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">
                      Custom tip
                    </Label>
                  </div>
                  {tipOption === "custom" && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={customTipPercent}
                        onChange={(e) => setCustomTipPercent(Number(e.target.value))}
                        min={0}
                        max={50}
                        step={1}
                        className="w-20"
                      />
                      <span className="text-sm">%</span>
                      <span className="text-sm text-muted-foreground">
                        (${Math.round(tierAmount * (customTipPercent / 100) * 100) / 100})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>

            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Donation amount:</span>
                <span className="font-medium">${tierAmount.toFixed(2)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform tip:</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Button onClick={initiateCheckout} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Checkout"
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            You'll be redirected to Stripe's secure payment page
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
