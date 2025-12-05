"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"
import { updateEmailRecipients } from "@/app/actions/tenant-settings"

export function EmailRecipientsSettings({
  tenantId,
  currentRecipients,
  primaryEmail,
}: {
  tenantId: string
  currentRecipients: string[]
  primaryEmail: string
}) {
  const [recipients, setRecipients] = useState<string[]>(currentRecipients)
  const [newEmail, setNewEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addEmail = () => {
    if (!newEmail) return

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (recipients.includes(newEmail)) {
      toast.error("This email is already in the list")
      return
    }

    setRecipients([...recipients, newEmail])
    setNewEmail("")
  }

  const removeEmail = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateEmailRecipients(tenantId, recipients)
      toast.success("Email recipients updated successfully")
    } catch (error) {
      toast.error("Failed to update email recipients")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Form Email Recipients</CardTitle>
        <CardDescription>
          Add multiple email addresses to receive contact form submissions. All listed emails will receive notifications
          when someone submits your contact form.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Primary Email</Label>
          <Badge variant="secondary">{primaryEmail}</Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Your primary email always receives contact form submissions
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Additional Recipients</Label>
          <div className="flex gap-2 mb-3">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addEmail()
                }
              }}
            />
            <Button onClick={addEmail} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {recipients.map((email) => (
                <Badge key={email} variant="outline" className="gap-2">
                  {email}
                  <button onClick={() => removeEmail(email)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {recipients.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No additional recipients. Only your primary email will receive submissions.
            </p>
          )}
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Recipients"}
        </Button>
      </CardContent>
    </Card>
  )
}
