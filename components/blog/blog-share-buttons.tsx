"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"

interface BlogShareButtonsProps {
  postUrl: string
  title: string
  excerpt?: string | null
}

export function BlogShareButtons({ postUrl, title, excerpt }: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const getUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href
    }
    return postUrl
  }

  const handleFacebookShare = () => {
    const url = getUrl()
    let shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    if (excerpt) {
      shareUrl += `&quote=${encodeURIComponent(excerpt)}`
    }
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer")
  }

  const handleCopyUrl = async () => {
    const url = getUrl()
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input")
      input.value = url
      input.style.position = "fixed"
      input.style.opacity = "0"
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <span className="text-sm text-muted-foreground">Share this:</span>
      
      <button
        onClick={handleFacebookShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{
          backgroundColor: "#1877F2",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
        Facebook
      </button>

      <button
        onClick={handleCopyUrl}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50"
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Copy Link
          </>
        )}
      </button>
    </div>
  )
}
