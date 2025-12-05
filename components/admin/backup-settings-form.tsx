"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BackupSettingsFormProps {
  currentEmails: string[]
}

export function BackupSettingsForm({ currentEmails }: BackupSettingsFormProps) {
  const router = useRouter()
  const [emails, setEmails] = useState<string[]>(currentEmails)
  const [newEmail, setNewEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const addEmail = () => {
    if (newEmail && !emails.includes(newEmail)) {
      setEmails([...emails, newEmail])
      setNewEmail("")
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove))
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/backup-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to save backup settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Recipients</CardTitle>
        <CardDescription>Add or remove email addresses that should receive backup notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {emails.map((email) => (
            <div key={email} className="flex items-center gap-2">
              <Input value={email} disabled className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEmail(email)}
                disabled={emails.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-email">Add New Email</Label>
          <div className="flex gap-2">
            <Input
              id="new-email"
              type="email"
              placeholder="admin@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addEmail()
                }
              }}
            />
            <Button type="button" onClick={addEmail} disabled={!newEmail}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <Button onClick={saveSettings} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
