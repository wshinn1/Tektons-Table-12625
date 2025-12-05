"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateNotificationSettings } from "@/app/actions/tenant-settings"

interface NotificationSettingsProps {
  tenantId: string
  primaryEmail: string
  notificationEmail: string | null
  settings: {
    donation_notifications?: boolean
    new_supporter_notifications?: boolean
    monthly_summary?: boolean
    failed_payment_alerts?: boolean
  }
}

export function TenantNotificationSettings({
  tenantId,
  primaryEmail,
  notificationEmail,
  settings,
}: NotificationSettingsProps) {
  const [email, setEmail] = useState(notificationEmail || primaryEmail)
  const [donationNotifications, setDonationNotifications] = useState(settings.donation_notifications ?? true)
  const [newSupporterNotifications, setNewSupporterNotifications] = useState(
    settings.new_supporter_notifications ?? true,
  )
  const [monthlySummary, setMonthlySummary] = useState(settings.monthly_summary ?? true)
  const [failedPaymentAlerts, setFailedPaymentAlerts] = useState(settings.failed_payment_alerts ?? true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateNotificationSettings({
        notificationEmail: email === primaryEmail ? null : email,
        settings: {
          donation_notifications: donationNotifications,
          new_supporter_notifications: newSupporterNotifications,
          monthly_summary: monthlySummary,
          failed_payment_alerts: failedPaymentAlerts,
        },
      })

      if (result.success) {
        toast.success("Notification settings updated successfully")
      } else {
        toast.error(result.error || "Failed to update settings")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>Choose which notifications you'd like to receive via email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notification-email">Notification Email Address</Label>
          <Input
            id="notification-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={primaryEmail}
          />
          <p className="text-sm text-muted-foreground">
            Where you'll receive donation notifications (defaults to your account email)
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="donation-notifications">Donation Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive an email every time someone makes a donation</p>
            </div>
            <Switch
              id="donation-notifications"
              checked={donationNotifications}
              onCheckedChange={setDonationNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-supporter">New Supporter Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when a first-time supporter gives</p>
            </div>
            <Switch
              id="new-supporter"
              checked={newSupporterNotifications}
              onCheckedChange={setNewSupporterNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="monthly-summary">Monthly Summary</Label>
              <p className="text-sm text-muted-foreground">
                Receive a monthly report of all donations and supporter activity
              </p>
            </div>
            <Switch id="monthly-summary" checked={monthlySummary} onCheckedChange={setMonthlySummary} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="failed-payments">Failed Payment Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when a recurring payment fails</p>
            </div>
            <Switch id="failed-payments" checked={failedPaymentAlerts} onCheckedChange={setFailedPaymentAlerts} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Notification Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
