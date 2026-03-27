"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { saveNewsletterFromName } from "@/app/actions/tenant-settings"

export function NewsletterFromSettings({ tenantId, currentFromName }: { tenantId: string; currentFromName: string }) {
  const [fromName, setFromName] = useState(currentFromName)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!fromName.trim()) { toast.error("Sender name cannot be empty"); return }
    setIsLoading(true)
    try {
      const result = await saveNewsletterFromName(tenantId, fromName)
      result.success ? toast.success("Sender name saved") : toast.error(result.error || "Failed to save")
    } catch { toast.error("Failed to save sender name") }
    finally { setIsLoading(false) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Sender Name</CardTitle>
        <CardDescription>
          The name subscribers see in their inbox — e.g. <strong>Wes Shinn</strong> instead of <strong>hello</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="from-name">Display Name</Label>
          <Input id="from-name" placeholder="e.g. Wes Shinn" value={fromName} onChange={(e) => setFromName(e.target.value)} maxLength={100} />
          <p className="text-xs text-muted-foreground">Subscribers will see: <strong>{fromName || "Your Name"}</strong> &lt;hello@tektonstable.com&gt;</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>{isLoading ? "Saving..." : "Save Sender Name"}</Button>
      </CardContent>
    </Card>
  )
}
