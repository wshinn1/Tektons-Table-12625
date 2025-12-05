"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Mail, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface CampaignShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: {
    title: string
    slug: string
  }
  subdomain: string
}

export function CampaignShareDialog({ open, onOpenChange, campaign, subdomain }: CampaignShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"
  const campaignUrl = `${baseUrl}/${subdomain}/campaigns/${campaign.slug}`
  const shareText = `Support ${campaign.title}!`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleShare = (platform: string) => {
    let url = ""

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`
        break
      case "email":
        url = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Check out this campaign: ${campaignUrl}`)}`
        break
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this campaign</DialogTitle>
          <DialogDescription>Help spread the word about {campaign.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Social share buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleShare("facebook")}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Facebook className="h-6 w-6 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleShare("twitter")}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Twitter className="h-6 w-6 text-sky-500" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleShare("email")}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Mail className="h-6 w-6 text-gray-600" />
              <span className="text-xs">Email</span>
            </Button>
          </div>

          {/* Copy link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign link</label>
            <div className="flex gap-2">
              <Input value={campaignUrl} readOnly className="flex-1" />
              <Button size="icon" variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
