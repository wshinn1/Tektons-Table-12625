"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateBlogWidgetPreference } from "@/app/actions/tenant-settings"
import { toast } from "sonner"

interface BlogWidgetSettingsProps {
  tenantId: string
  currentPreference: string
}

export function BlogWidgetSettings({ tenantId, currentPreference }: BlogWidgetSettingsProps) {
  const [preference, setPreference] = useState(currentPreference || "giving")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("blog_widget_preference", preference)

      const result = await updateBlogWidgetPreference(formData)

      if (result.success) {
        toast.success("Blog widget preference updated successfully")
      } else {
        toast.error(result.error || "Failed to update preference")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Post Widget</CardTitle>
        <CardDescription>Choose which widget to display on your blog post pages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog_widget">Widget Type</Label>
            <Select value={preference} onValueChange={setPreference}>
              <SelectTrigger id="blog_widget">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="giving">Giving Widget (Support/Donations)</SelectItem>
                <SelectItem value="campaign">Campaign Widget (Active Campaign Progress)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {preference === "campaign"
                ? "Your active campaign widget will be displayed on blog posts"
                : "Your general support/giving widget will be displayed on blog posts"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Update Widget Preference"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
