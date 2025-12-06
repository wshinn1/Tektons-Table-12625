"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateBrandingSettings } from "@/app/actions/tenant-settings"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, RefreshCw, Globe, Share2 } from "lucide-react"

// Default TektonsTable branding
const DEFAULT_FAVICON = "/images/android-chrome-512x512.png"
const DEFAULT_OG_IMAGE = "/images/tektons-20table-whitebg.png"
const DEFAULT_SITE_TITLE = "Long Term Funding Support"
const DEFAULT_SITE_DESCRIPTION = "Support missionaries and ministries with recurring donations through TektonsTable"

interface BrandingSettingsProps {
  tenantId: string
  currentFaviconUrl: string | null
  currentOgImageUrl: string | null
  currentSiteTitle: string | null
  currentSiteDescription: string | null
  tenantName: string
}

export function BrandingSettings({
  tenantId,
  currentFaviconUrl,
  currentOgImageUrl,
  currentSiteTitle,
  currentSiteDescription,
  tenantName,
}: BrandingSettingsProps) {
  const [faviconUrl, setFaviconUrl] = useState(currentFaviconUrl || DEFAULT_FAVICON)
  const [ogImageUrl, setOgImageUrl] = useState(currentOgImageUrl || DEFAULT_OG_IMAGE)
  const [siteTitle, setSiteTitle] = useState(currentSiteTitle || DEFAULT_SITE_TITLE)
  const [siteDescription, setSiteDescription] = useState(currentSiteDescription || DEFAULT_SITE_DESCRIPTION)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateBrandingSettings({
        tenantId,
        faviconUrl: faviconUrl || DEFAULT_FAVICON,
        ogImageUrl: ogImageUrl || DEFAULT_OG_IMAGE,
        siteTitle: siteTitle || DEFAULT_SITE_TITLE,
        siteDescription: siteDescription || DEFAULT_SITE_DESCRIPTION,
      })

      if (result.success) {
        toast.success("Branding settings updated successfully")
      } else {
        toast.error(result.error || "Failed to update branding settings")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetToDefaults = () => {
    setFaviconUrl(DEFAULT_FAVICON)
    setOgImageUrl(DEFAULT_OG_IMAGE)
    setSiteTitle(DEFAULT_SITE_TITLE)
    setSiteDescription(DEFAULT_SITE_DESCRIPTION)
    toast.info("Reset to TektonsTable defaults. Click Save to apply.")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Branding & Social Sharing
            </CardTitle>
            <CardDescription>
              Customize how your site appears in browser tabs and when shared on social media
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Site Title & Description */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">SEO & Browser Tab</h3>

          <div className="space-y-2">
            <Label htmlFor="site_title">Site Title</Label>
            <Input
              id="site_title"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Long Term Funding Support"
            />
            <p className="text-xs text-muted-foreground">
              Appears in browser tabs. Your name ({tenantName}) will be appended.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Support missionaries and ministries..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Used for SEO and social media previews (max 160 characters recommended)
            </p>
          </div>
        </div>

        {/* Favicon */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Favicon (Browser Icon)</h3>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                {faviconUrl ? (
                  <Image
                    src={faviconUrl || "/placeholder.svg"}
                    alt="Favicon preview"
                    width={48}
                    height={48}
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">Preview</p>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="favicon_url">Favicon URL</Label>
              <Input
                id="favicon_url"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://example.com/favicon.png"
              />
              <p className="text-xs text-muted-foreground">Recommended: Square PNG or ICO, at least 512x512 pixels</p>
            </div>
          </div>
        </div>

        {/* Open Graph Image */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Sharing Image
          </h3>

          <div className="space-y-4">
            <div className="aspect-[1.91/1] max-w-md rounded-lg border bg-muted overflow-hidden">
              {ogImageUrl ? (
                <Image
                  src={ogImageUrl || "/placeholder.svg"}
                  alt="Social sharing preview"
                  width={600}
                  height={314}
                  className="w-full h-full object-contain bg-white"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image_url">Open Graph Image URL</Label>
              <Input
                id="og_image_url"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="https://example.com/og-image.png"
              />
              <p className="text-xs text-muted-foreground">
                This image appears when your site is shared on Facebook, Twitter, LinkedIn, etc. Recommended: 1200x630
                pixels
              </p>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Social Share Preview
          </h3>
          <div className="max-w-md rounded-lg border overflow-hidden bg-white shadow-sm">
            <div className="aspect-[1.91/1] bg-muted overflow-hidden">
              {ogImageUrl && (
                <Image
                  src={ogImageUrl || "/placeholder.svg"}
                  alt="Preview"
                  width={600}
                  height={314}
                  className="w-full h-full object-contain bg-white"
                  unoptimized
                />
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground uppercase">tektonstable.com</p>
              <p className="font-semibold text-sm line-clamp-1">
                {siteTitle || DEFAULT_SITE_TITLE} | {tenantName}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {siteDescription || DEFAULT_SITE_DESCRIPTION}
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Branding Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
