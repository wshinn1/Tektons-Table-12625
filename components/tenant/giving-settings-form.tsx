"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateGivingSettings } from "@/app/actions/giving"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Heart, Info, Target } from "lucide-react"

interface GivingSettings {
  show_progress?: boolean
  thank_you_message?: string
  custom_tiers?: any
  fee_model?: "donor_tips" | "platform_fee"
  suggested_tip_percent?: number
  fundraising_start_amount?: number
  fundraising_target_goal?: number
  show_donor_names?: boolean
  show_progress_widget?: boolean
}

export function GivingSettingsForm({
  tenantId,
  initialSettings,
}: {
  tenantId: string
  initialSettings?: GivingSettings
}) {
  const [showProgress, setShowProgress] = useState(initialSettings?.show_progress ?? true)
  const [thankYouMessage, setThankYouMessage] = useState(initialSettings?.thank_you_message || "")
  const [feeModel, setFeeModel] = useState<"donor_tips" | "platform_fee">(initialSettings?.fee_model || "donor_tips")
  const [suggestedTipPercent, setSuggestedTipPercent] = useState(initialSettings?.suggested_tip_percent || 12)

  const [startingAmount, setStartingAmount] = useState(initialSettings?.fundraising_start_amount || 0)
  const [targetGoal, setTargetGoal] = useState(initialSettings?.fundraising_target_goal || 5000)
  const [showDonorNames, setShowDonorNames] = useState(initialSettings?.show_donor_names ?? false)
  const [showWidget, setShowWidget] = useState(initialSettings?.show_progress_widget ?? true)

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateGivingSettings(tenantId, {
        show_progress: showProgress,
        thank_you_message: thankYouMessage,
        fee_model: feeModel,
        suggested_tip_percent: suggestedTipPercent,
        fundraising_start_amount: startingAmount,
        fundraising_target_goal: targetGoal,
        show_donor_names: showDonorNames,
        show_progress_widget: showWidget,
      })

      toast({
        title: "Settings saved",
        description: "Your giving page settings have been updated.",
      })
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Fundraising Goals
          </CardTitle>
          <CardDescription>Configure your fundraising progress and target amounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starting-amount">Starting Amount Raised ($)</Label>
              <Input
                id="starting-amount"
                type="number"
                value={startingAmount}
                onChange={(e) => setStartingAmount(Number(e.target.value))}
                min={0}
                step={100}
              />
              <p className="text-xs text-muted-foreground">Amount already raised before using this platform</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-goal">Target Fundraising Goal ($)</Label>
              <Input
                id="target-goal"
                type="number"
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                min={0}
                step={100}
              />
              <p className="text-xs text-muted-foreground">Your total fundraising target to be fully funded</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Show Giving Widget</Label>
              <p className="text-xs text-muted-foreground">Display sticky progress widget on home and blog pages</p>
            </div>
            <Switch checked={showWidget} onCheckedChange={setShowWidget} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Show Donor Names</Label>
              <p className="text-xs text-muted-foreground">
                Display recent donor names in the widget (default: hidden for privacy)
              </p>
            </div>
            <Switch checked={showDonorNames} onCheckedChange={setShowDonorNames} />
          </div>

          {startingAmount > 0 || targetGoal > 0 ? (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-semibold">
                  {startingAmount > 0 && targetGoal > 0
                    ? `${Math.round((startingAmount / targetGoal) * 100)}%`
                    : "Set both values"}
                </span>
              </div>
              {startingAmount > 0 && targetGoal > 0 && (
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((startingAmount / targetGoal) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Giving Page Settings</CardTitle>
          <CardDescription>Configure your fundraising goals and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Progress Bar</Label>
              <p className="text-xs text-muted-foreground">Display your fundraising progress to visitors</p>
            </div>
            <Switch checked={showProgress} onCheckedChange={setShowProgress} />
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Platform Support Model</Label>
              <p className="text-sm text-muted-foreground">Choose how you want to support the platform costs</p>
            </div>

            <RadioGroup value={feeModel} onValueChange={(value: any) => setFeeModel(value)}>
              <div className="space-y-3">
                {/* Donor Tips Option */}
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value="donor_tips" id="donor_tips" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="donor_tips" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Heart className="h-4 w-4 text-pink-500" />
                      Cover Platform Costs (Recommended)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Donors can optionally tip to cover platform fees. You receive 100% of donations.
                    </p>
                    {feeModel === "donor_tips" && (
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="tip-percent" className="text-sm">
                          Suggested Tip %
                        </Label>
                        <Input
                          id="tip-percent"
                          type="number"
                          value={suggestedTipPercent}
                          onChange={(e) => setSuggestedTipPercent(Number(e.target.value))}
                          min={0}
                          max={25}
                          step={0.5}
                          className="max-w-[120px]"
                        />
                        <p className="text-xs text-muted-foreground">Typical: 10-15%. Donors can adjust or opt out.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Fee Option */}
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value="platform_fee" id="platform_fee" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="platform_fee" className="flex items-center gap-2 font-medium cursor-pointer">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Simple Pricing
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Platform fee (3.5%) is deducted from donations automatically. No tips shown to donors.
                    </p>
                    <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>Example: $100 donation = $96.50 to you, $3.50 platform fee</span>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thank-you">Thank You Message</Label>
            <Textarea
              id="thank-you"
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              placeholder="Thank you for your generous support! Your partnership makes our mission possible."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Message shown to supporters after they donate</p>
          </div>

          <Button onClick={handleSave} disabled={isLoading} size="lg">
            {isLoading ? "Saving..." : "Save All Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
