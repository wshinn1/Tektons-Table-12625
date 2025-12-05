"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateSiteMetadata, uploadFavicon, uploadOgImage, type SiteMetadata } from "@/app/actions/site-settings"
import { toast } from "sonner"
import { Upload, Loader2 } from "lucide-react"
import Image from "next/image"

interface Props {
  initialMetadata: SiteMetadata
}

export function SiteSettingsForm({ initialMetadata }: Props) {
  const [metadata, setMetadata] = useState<SiteMetadata>(initialMetadata)
  const [loading, setLoading] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [uploadingOg, setUploadingOg] = useState(false)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const ogImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMetadata(initialMetadata)
  }, [initialMetadata])

  const saveMetadata = async (newMetadata: SiteMetadata) => {
    const result = await updateSiteMetadata(newMetadata)
    if (result.success) {
      toast.success("Settings saved successfully")
    } else {
      toast.error(result.error || "Failed to save settings")
    }
    return result.success
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await saveMetadata(metadata)
    setLoading(false)
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFavicon(true)
    const formData = new FormData()
    formData.append("favicon", file)

    const result = await uploadFavicon(formData)

    if (result.success && result.url) {
      const newMetadata = { ...metadata, favicon_url: result.url }
      setMetadata(newMetadata)
      await saveMetadata(newMetadata)
    } else {
      toast.error(result.error || "Failed to upload favicon")
    }

    setUploadingFavicon(false)
  }

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingOg(true)
    const formData = new FormData()
    formData.append("og_image", file)

    const result = await uploadOgImage(formData)

    if (result.success && result.url) {
      const newMetadata = { ...metadata, og_image: result.url }
      setMetadata(newMetadata)
      await saveMetadata(newMetadata)
    } else {
      toast.error(result.error || "Failed to upload image")
    }

    setUploadingOg(false)
    if (ogImageInputRef.current) {
      ogImageInputRef.current.value = ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Site Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure your site's basic identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Site Title</Label>
            <Input
              id="title"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              placeholder="Your Site Name"
            />
          </div>

          <div>
            <Label htmlFor="description">Site Description</Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              placeholder="A brief description of your site"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="favicon">Favicon URL</Label>
            {metadata.favicon_url && (
              <div className="mb-2">
                <Image
                  src={metadata.favicon_url || "/placeholder.svg"}
                  alt="Favicon preview"
                  width={32}
                  height={32}
                  className="rounded"
                />
              </div>
            )}
            <Input
              id="favicon"
              value={metadata.favicon_url}
              onChange={(e) => setMetadata({ ...metadata, favicon_url: e.target.value })}
              placeholder="/favicon.ico"
            />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingFavicon}
                onClick={() => faviconInputRef.current?.click()}
              >
                {uploadingFavicon ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Favicon
                  </>
                )}
              </Button>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*,.ico"
                className="hidden"
                onChange={handleFaviconUpload}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Social Sharing</CardTitle>
          <CardDescription>Configure how your site appears when shared on social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="og-image">Open Graph Image URL</Label>
            {metadata.og_image && (
              <div className="mb-2 relative w-full max-w-md aspect-[1200/630] rounded-lg overflow-hidden border">
                <Image
                  src={metadata.og_image || "/placeholder.svg"}
                  alt="OG image preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Input
              id="og-image"
              value={metadata.og_image}
              onChange={(e) => setMetadata({ ...metadata, og_image: e.target.value })}
              placeholder="/og-image.png"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended size: 1200x630px. Used when sharing on Facebook, LinkedIn, etc.
            </p>
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingOg}
                onClick={() => ogImageInputRef.current?.click()}
              >
                {uploadingOg ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Browse & Upload OG Image
                  </>
                )}
              </Button>
              <input
                ref={ogImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleOgImageUpload}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="twitter-card">Twitter Card Type</Label>
              <select
                id="twitter-card"
                value={metadata.twitter_card}
                onChange={(e) => setMetadata({ ...metadata, twitter_card: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary with Large Image</option>
              </select>
            </div>

            <div>
              <Label htmlFor="twitter-site">Twitter Handle</Label>
              <Input
                id="twitter-site"
                value={metadata.twitter_site}
                onChange={(e) => setMetadata({ ...metadata, twitter_site: e.target.value })}
                placeholder="@yourhandle"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}
