"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Loader2 } from "lucide-react"

interface PremiumSubscriptionCtaProps {
  variant: "compact" | "full"
}

const benefits = [
  "Access to all premium resources",
  "In-depth fundraising guides",
  "Expert strategies and templates",
  "New content added regularly",
  "Cancel anytime",
]

export function PremiumSubscriptionCta({ variant }: PremiumSubscriptionCtaProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
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
      } else if (data.error === "Not authenticated") {
        router.push("/auth/login?redirect=/resources")
      } else {
        console.error("Subscribe error:", data.error)
      }
    } catch (err) {
      console.error("Subscribe error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-4 bg-card border rounded-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Unlock Premium Resources</p>
            <p className="text-sm text-muted-foreground">$4.99/month - Cancel anytime</p>
          </div>
        </div>
        <Button onClick={handleSubscribe} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
    )
  }

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-amber-500" />
        </div>
        <CardTitle className="text-2xl">Unlock Premium Resources</CardTitle>
        <CardDescription className="text-lg">
          Get access to all premium fundraising guides and strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <span className="text-4xl font-bold text-foreground">$4.99</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        <ul className="space-y-3">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-foreground">{benefit}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Reading Now"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">Cancel anytime. No questions asked.</p>
      </CardContent>
    </Card>
  )
}
