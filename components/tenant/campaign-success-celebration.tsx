"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CampaignSuccessCelebrationProps {
  amount: number
  campaignTitle: string
  isRecurring?: boolean
}

export function CampaignSuccessCelebration({
  amount,
  campaignTitle,
  isRecurring = false,
}: CampaignSuccessCelebrationProps) {
  useEffect(() => {
    // Confetti animation on mount
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Green confetti (campaign theme)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#22c55e", "#16a34a", "#15803d"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#22c55e", "#16a34a", "#15803d"],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Thank You!</h2>
          <p className="text-lg">
            Your {isRecurring && "recurring "}donation of <span className="font-bold text-green-600">${amount}</span>
            {isRecurring && "/month"} to <span className="font-semibold">{campaignTitle}</span> has been processed
            successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            {isRecurring
              ? "You will receive a receipt via email for each payment."
              : "A receipt has been sent to your email."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
