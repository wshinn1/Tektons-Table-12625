"use client"

import { Button } from "@/components/ui/button"

interface ShareButtonsProps {
  shareUrl: string
  shareText: string
  campaignTitle: string
}

export function ShareButtons({ shareUrl, shareText, campaignTitle }: ShareButtonsProps) {
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaignTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or share failed
        console.error("Share failed:", error)
      }
    }
  }

  return (
    <div className="flex gap-2">
      {/* Show native share button on mobile devices that support it */}
      {typeof navigator !== "undefined" && navigator.share && (
        <Button variant="outline" size="sm" onClick={handleNativeShare} className="flex-1 bg-transparent">
          Share
        </Button>
      )}
      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on X
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on Facebook
        </a>
      </Button>
    </div>
  )
}
