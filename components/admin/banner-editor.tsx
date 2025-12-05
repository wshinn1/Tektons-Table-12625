"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, EyeOff } from "lucide-react"
import { updateSiteContent } from "@/app/actions/site-content"

interface BannerData {
  id: string
  section: string
  content: {
    enabled: boolean
    text: string
    ctaText: string
    ctaLink: string
  }
  is_active: boolean
}

interface BannerEditorProps {
  initialData: BannerData | null
}

export function BannerEditor({ initialData }: BannerEditorProps) {
  const [enabled, setEnabled] = useState(initialData?.content?.enabled ?? false)
  const [text, setText] = useState(initialData?.content?.text ?? "")
  const [ctaText, setCtaText] = useState(initialData?.content?.ctaText ?? "Get started")
  const [ctaLink, setCtaLink] = useState(initialData?.content?.ctaLink ?? "/auth/signup")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!initialData?.id) {
      toast({
        title: "Error",
        description: "Banner data not found. Please run the database seed script.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const content = {
        enabled,
        text,
        ctaText,
        ctaLink,
      }

      const result = await updateSiteContent(initialData.id, content, true)

      if (result.success) {
        toast({
          title: "Banner updated",
          description: "Your changes have been saved and are now live.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update banner",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>This is how the banner will appear on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          {enabled ? (
            <div className="bg-accent/10 border border-accent/20 py-2.5 text-center rounded-lg">
              <p className="text-sm text-foreground/80">
                <span className="font-semibold text-accent">New:</span> {text || "Your announcement text here"}{" "}
                <span className="text-accent hover:underline font-medium cursor-pointer">
                  {ctaText || "Get started"}
                </span>
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 border border-dashed border-border py-8 text-center rounded-lg">
              <EyeOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Banner is currently hidden</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Settings</CardTitle>
          <CardDescription>Configure the announcement banner content and visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="banner-enabled" className="text-base font-medium">
                Show Banner
              </Label>
              <p className="text-sm text-muted-foreground">Toggle the banner visibility on the homepage</p>
            </div>
            <Switch id="banner-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Banner Text */}
          <div className="space-y-2">
            <Label htmlFor="banner-text">Announcement Text</Label>
            <Input
              id="banner-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., We just launched a new feature!"
            />
            <p className="text-xs text-muted-foreground">The main message shown in the banner (appears after "New:")</p>
          </div>

          {/* CTA Text */}
          <div className="space-y-2">
            <Label htmlFor="cta-text">Button Text</Label>
            <Input
              id="cta-text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g., Learn more"
            />
            <p className="text-xs text-muted-foreground">The clickable link text at the end of the banner</p>
          </div>

          {/* CTA Link */}
          <div className="space-y-2">
            <Label htmlFor="cta-link">Button Link</Label>
            <Input
              id="cta-link"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="e.g., /pricing or /blog/new-feature"
            />
            <p className="text-xs text-muted-foreground">
              Where users go when they click the button (use relative paths like /pricing)
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
