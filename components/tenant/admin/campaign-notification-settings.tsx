"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { updateCampaignNotificationPreference } from "@/app/actions/campaigns"

export function CampaignNotificationSettings({
  tenantId,
  currentPreference,
}: {
  tenantId: string
  currentPreference: string
}) {
  const [preference, setPreference] = useState(currentPreference)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateCampaignNotificationPreference(tenantId, preference)

      if (result.success) {
        toast({
          title: "Notification preferences updated",
          description: "Your campaign notification settings have been saved.",
        })
      } else {
        throw new Error(result.error || "Failed to update preferences")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Campaign Donation Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified when someone donates to your campaigns.
          </p>
        </div>

        <RadioGroup value={preference} onValueChange={setPreference}>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="immediate" className="font-medium cursor-pointer">
                  Immediate notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get an email right away whenever someone donates to any of your campaigns.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="daily" id="daily" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="daily" className="font-medium cursor-pointer">
                  Daily digest
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive one email at noon EST each day with a summary of all campaign donations from the previous day.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="off" id="off" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="off" className="font-medium cursor-pointer">
                  No notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Don't send me email notifications for campaign donations. I'll check the admin dashboard manually.
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>

        <Button onClick={handleSave} disabled={isLoading || preference === currentPreference}>
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </Card>
  )
}
