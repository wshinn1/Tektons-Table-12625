"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createCampaign, updateCampaign } from "@/app/actions/campaigns"
import { toast } from "sonner"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import Tiptap editor
const TiptapEditor = dynamic(() => import("@/components/admin/blog/tiptap-editor").then((mod) => mod.TiptapEditor), {
  loading: () => (
    <div className="border rounded-lg p-4">
      <Skeleton className="h-40 w-full" />
    </div>
  ),
  ssr: false,
})

interface CampaignFormProps {
  tenantId: string
  subdomain: string
  campaign?: any
}

export function CampaignForm({ tenantId, subdomain, campaign }: CampaignFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Form state
  const [title, setTitle] = useState(campaign?.title || "")
  const [slug, setSlug] = useState(campaign?.slug || "")
  const [description, setDescription] = useState(campaign?.description || "")
  const [goalAmount, setGoalAmount] = useState(campaign?.goal_amount?.toString() || "")
  const [featuredImage, setFeaturedImage] = useState(campaign?.featured_image_url || "")
  const [startDate, setStartDate] = useState(
    campaign?.start_date ? new Date(campaign.start_date).toISOString().split("T")[0] : "",
  )
  const [endDate, setEndDate] = useState(
    campaign?.end_date ? new Date(campaign.end_date).toISOString().split("T")[0] : "",
  )
  const [showInMenu, setShowInMenu] = useState(campaign?.show_in_menu ?? true)
  const [showDonorList, setShowDonorList] = useState(campaign?.show_donor_list ?? true)
  const [allowAnonymous, setAllowAnonymous] = useState(campaign?.allow_anonymous ?? true)
  const [recentDonationsLimit, setRecentDonationsLimit] = useState(campaign?.recent_donations_limit?.toString() || "10")
  const [suggestedAmounts, setSuggestedAmounts] = useState(
    campaign?.suggested_amounts?.join(", ") || "25, 50, 100, 250, 500",
  )

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!campaign) {
      // Only auto-generate slug for new campaigns
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 50)
      setSlug(autoSlug)
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("[v0] Campaign form - Starting image upload")
    console.log("[v0] File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      tenantId: tenantId,
    })

    if (!file.type.startsWith("image/")) {
      console.log("[v0] Invalid file type:", file.type)
      toast.error("Please upload an image file")
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tenantId", tenantId)

      console.log("[v0] FormData prepared, sending to /api/tenant/upload-media")
      console.log("[v0] Tenant ID:", tenantId)

      const response = await fetch("/api/tenant/upload-media", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Upload failed with error:", errorData)
        throw new Error(errorData.error || "Upload failed")
      }

      const { url } = await response.json()
      console.log("[v0] Upload successful! Image URL:", url)

      setFeaturedImage(url)
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("[v0] Campaign form - Image upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploadingImage(false)
      console.log("[v0] Upload process complete")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Please enter a campaign title")
      return
    }

    if (!goalAmount || Number.parseFloat(goalAmount) <= 0) {
      toast.error("Please enter a valid goal amount")
      return
    }

    setIsSubmitting(true)

    try {
      // Parse suggested amounts
      const amounts = suggestedAmounts
        .split(",")
        .map((a) => Number.parseFloat(a.trim()))
        .filter((a) => !isNaN(a) && a > 0)

      const campaignData = {
        title,
        slug: slug || undefined,
        description,
        goal_amount: Number.parseFloat(goalAmount),
        featured_image_url: featuredImage || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        show_in_menu: showInMenu,
        show_donor_list: showDonorList,
        allow_anonymous: allowAnonymous,
        recent_donations_limit: Number.parseInt(recentDonationsLimit) || 10,
        suggested_amounts: amounts,
        status: "active",
      }

      if (campaign) {
        // Update existing campaign
        const result = await updateCampaign(campaign.id, campaignData)
        if (result.error) throw new Error(result.error)
        toast.success("Campaign updated successfully")
      } else {
        // Create new campaign
        const result = await createCampaign(tenantId, campaignData)
        if (result.error) throw new Error(result.error)
        toast.success("Campaign created successfully")
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push(`/admin/campaigns`)
      router.refresh()
    } catch (error) {
      console.error("Failed to save campaign:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save campaign")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Campaign title, description, and featured image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Medical Mission Trip to Honduras"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/{subdomain}/campaigns/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="medical-mission-honduras"
                className="flex-1"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">This will be the URL for your campaign page</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Campaign Description *</Label>
            <TiptapEditor
              initialContent={description}
              onChange={setDescription}
              placeholder="Tell the story of your campaign. Why are you raising funds? What will the money be used for?"
            />
          </div>

          <div className="space-y-2">
            <Label>Featured Image</Label>
            {featuredImage ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                <Image
                  src={featuredImage || "/placeholder.svg"}
                  alt="Campaign featured image"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFeaturedImage("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {isUploadingImage ? "Uploading..." : "Click to upload featured image"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploadingImage}
                />
                <label htmlFor="image-upload">
                  <Button type="button" variant="outline" size="sm" asChild disabled={isUploadingImage}>
                    <span>Choose Image</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fundraising Details */}
      <Card>
        <CardHeader>
          <CardTitle>Fundraising Details</CardTitle>
          <CardDescription>Set your goal and suggested donation amounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
            <Input
              id="goalAmount"
              type="number"
              step="0.01"
              min="1"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="5000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestedAmounts">Suggested Donation Amounts ($)</Label>
            <Input
              id="suggestedAmounts"
              value={suggestedAmounts}
              onChange={(e) => setSuggestedAmounts(e.target.value)}
              placeholder="25, 50, 100, 250, 500"
            />
            <p className="text-xs text-muted-foreground">Comma-separated values for donation amount buttons</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Control how your campaign appears to visitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show in Navigation Menu</Label>
              <p className="text-sm text-muted-foreground">Display this campaign in your site menu</p>
            </div>
            <Switch checked={showInMenu} onCheckedChange={setShowInMenu} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Donor Names</Label>
              <p className="text-sm text-muted-foreground">Display donor names in the recent donations list</p>
            </div>
            <Switch checked={showDonorList} onCheckedChange={setShowDonorList} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Anonymous Donations</Label>
              <p className="text-sm text-muted-foreground">Let donors choose to give anonymously</p>
            </div>
            <Switch checked={allowAnonymous} onCheckedChange={setAllowAnonymous} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recentDonationsLimit">Recent Donations to Show</Label>
            <Input
              id="recentDonationsLimit"
              type="number"
              min="5"
              max="50"
              value={recentDonationsLimit}
              onChange={(e) => setRecentDonationsLimit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Number of recent donations to display (5-50)</p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {campaign ? "Update Campaign" : "Create Campaign"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
