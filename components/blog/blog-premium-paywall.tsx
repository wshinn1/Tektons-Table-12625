"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Sparkles, Check, Loader2 } from "lucide-react"

interface BlogPremiumPaywallProps {
  post: {
    title: string
    subtitle?: string
    content?: any
    slug: string
  }
  isLoggedIn: boolean
}

const benefits = [
  "Access to all premium blog posts",
  "In-depth fundraising resources",
  "Exclusive strategies and templates",
  "New content added regularly",
  "Cancel anytime",
]

function getPreviewHtml(content: any): string {
  if (!content) return ""

  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content

    // Convert TipTap JSON to HTML, limiting to first few nodes
    let html = ""
    let wordCount = 0
    const maxWords = 150

    function renderNode(node: any): string {
      if (wordCount >= maxWords) return ""

      if (node.type === "text") {
        const words = (node.text || "").split(/\s+/)
        const remainingWords = maxWords - wordCount
        const textToUse = words.slice(0, remainingWords).join(" ")
        wordCount += Math.min(words.length, remainingWords)

        let text = textToUse
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === "bold") text = `<strong>${text}</strong>`
            if (mark.type === "italic") text = `<em>${text}</em>`
            if (mark.type === "underline") text = `<u>${text}</u>`
            if (mark.type === "link")
              text = `<a href="${mark.attrs?.href || "#"}" class="text-primary underline">${text}</a>`
          })
        }
        return text
      }

      if (node.type === "paragraph") {
        const content = node.content?.map(renderNode).join("") || ""
        return content ? `<p class="mb-4 leading-relaxed">${content}</p>` : ""
      }

      if (node.type === "heading") {
        const level = node.attrs?.level || 2
        const content = node.content?.map(renderNode).join("") || ""
        const sizes: Record<number, string> = {
          1: "text-3xl font-bold mb-4",
          2: "text-2xl font-bold mb-3",
          3: "text-xl font-semibold mb-2",
          4: "text-lg font-semibold mb-2",
        }
        return content ? `<h${level} class="${sizes[level] || sizes[2]}">${content}</h${level}>` : ""
      }

      if (node.type === "bulletList") {
        const items = node.content?.map(renderNode).join("") || ""
        return items ? `<ul class="list-disc pl-6 mb-4 space-y-1">${items}</ul>` : ""
      }

      if (node.type === "orderedList") {
        const items = node.content?.map(renderNode).join("") || ""
        return items ? `<ol class="list-decimal pl-6 mb-4 space-y-1">${items}</ol>` : ""
      }

      if (node.type === "listItem") {
        const content = node.content?.map(renderNode).join("") || ""
        return content ? `<li>${content.replace(/<\/?p[^>]*>/g, "")}</li>` : ""
      }

      if (node.type === "blockquote") {
        const content = node.content?.map(renderNode).join("") || ""
        return content
          ? `<blockquote class="border-l-4 border-muted-foreground/30 pl-4 italic my-4">${content}</blockquote>`
          : ""
      }

      if (node.type === "hardBreak") {
        return "<br />"
      }

      // Recursively render children for other node types
      if (node.content) {
        return node.content.map(renderNode).join("")
      }

      return ""
    }

    if (parsed.content) {
      for (const node of parsed.content) {
        if (wordCount >= maxWords) break
        html += renderNode(node)
      }
    }

    return html
  } catch {
    return ""
  }
}

export function BlogPremiumPaywall({ post, isLoggedIn }: BlogPremiumPaywallProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const previewHtml = useMemo(() => getPreviewHtml(post.content), [post.content])

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/api/premium/subscribe?returnUrl=${encodeURIComponent(`/blog/${post.slug}`)}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/premium/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("Subscribe error:", data.error)
      }
    } catch (err) {
      console.error("Subscribe error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Preview Content - render as formatted HTML */}
      {previewHtml && (
        <div className="relative">
          <div
            className="prose prose-lg max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />

          {/* Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>
      )}

      {/* Paywall Card */}
      <Card className="relative z-10 mt-8 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-background overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <CardHeader className="text-center relative">
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <CardTitle className="text-2xl md:text-3xl mb-2">Premium Content</CardTitle>
          <p className="text-muted-foreground text-lg">Subscribe to unlock this post and all premium content</p>
        </CardHeader>

        <CardContent className="relative space-y-8 max-w-lg mx-auto">
          <div className="text-center">
            <span className="text-5xl font-bold text-foreground">$4.99</span>
            <span className="text-xl text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-4">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 text-lg font-semibold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Subscribe Now
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already a subscriber?{" "}
              <Link
                href={`/auth/login?redirect=/blog/${post.slug}`}
                className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">Cancel anytime. No questions asked.</p>
        </CardContent>
      </Card>
    </div>
  )
}
