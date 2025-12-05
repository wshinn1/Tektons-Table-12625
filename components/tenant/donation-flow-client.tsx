"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart } from "lucide-react"
import { formatCurrency } from "@/lib/donation-tiers"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface DonationFlowClientProps {
  subdomain: string
  tenantId: string
  tenantName: string
  currentRaised: number
  goalAmount: number
  progressPercent: number
  supportersCount: number
}

const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000]
const SUGGESTED_INDEX = 2 // $200

export function DonationFlowClient({
  subdomain,
  tenantId,
  tenantName,
  currentRaised,
  goalAmount,
  progressPercent,
  supportersCount,
}: DonationFlowClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [donationType, setDonationType] = useState<"once" | "monthly">("monthly")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(PRESET_AMOUNTS[SUGGESTED_INDEX])
  const [customAmount, setCustomAmount] = useState("")
  const [displayAnonymous, setDisplayAnonymous] = useState(false)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, "")
    setCustomAmount(cleaned)
    setSelectedAmount(null)
  }

  const finalAmount = selectedAmount || (customAmount ? Number.parseFloat(customAmount) : 0)

  const handleContinue = () => {
    if (finalAmount <= 0) return

    console.log("[v0] Starting donation checkout with amount:", finalAmount, "type:", donationType)

    startTransition(() => {
      const params = new URLSearchParams({
        amount: finalAmount.toString(),
        type: donationType,
        anonymous: displayAnonymous.toString(),
      })

      router.push(`/giving/checkout?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      {/* Progress Header Card */}
      <Card className="p-6 bg-white dark:bg-gray-900">
        <div className="flex items-start gap-4">
          {/* Circular Progress */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-800"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                className="text-green-500 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{Math.round(progressPercent)}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{formatCurrency(currentRaised * 100)} raised</h1>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(goalAmount * 100)} goal · {supportersCount}{" "}
              {supportersCount === 1 ? "donation" : "donations"}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Donation Form */}
      <Card className="p-8 bg-white dark:bg-gray-900">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Enter your donation for</p>
            <h2 className="text-3xl font-bold text-balance">Support for {tenantName}</h2>
          </div>

          {/* Give Once / Monthly Toggle */}
          <div className="flex gap-2">
            <Button
              variant={donationType === "once" ? "secondary" : "ghost"}
              className={cn(
                "flex-1 h-12 text-base font-medium",
                donationType === "once" ? "bg-gray-100 dark:bg-gray-800" : "",
              )}
              onClick={() => setDonationType("once")}
            >
              Give once
            </Button>
            <Button
              variant={donationType === "monthly" ? "default" : "ghost"}
              className={cn(
                "flex-1 h-12 text-base font-medium gap-2",
                donationType === "monthly"
                  ? "bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700"
                  : "",
              )}
              onClick={() => setDonationType("monthly")}
            >
              Monthly <Heart className="h-4 w-4 fill-current" />
            </Button>
          </div>

          {/* Impact Message */}
          {donationType === "monthly" && (
            <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-1">
              Boost your impact by giving monthly <span className="text-green-600 dark:text-green-500">📈</span>
            </p>
          )}

          {/* Preset Amount Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((amount, index) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={cn(
                  "relative h-16 rounded-lg border-2 font-semibold text-lg transition-all",
                  selectedAmount === amount
                    ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
                )}
              >
                ${amount}
                {index === SUGGESTED_INDEX && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 dark:bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    SUGGESTED
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-start">
              <span className="text-4xl font-bold">$</span>
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
            <Input
              type="text"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder=".00"
              className={cn(
                "h-24 text-5xl font-bold pl-24 pr-6 border-2",
                !selectedAmount && customAmount
                  ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-gray-300 dark:border-gray-700",
              )}
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <Checkbox
              id="anonymous"
              checked={displayAnonymous}
              onCheckedChange={(checked) => setDisplayAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm cursor-pointer flex-1">
              Don't display my name publicly on the fundraiser.
            </Label>
          </div>

          {/* Donation Summary */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold">Your {donationType === "monthly" ? "monthly" : "one-time"} donation</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Your donation</span>
                <span>{formatCurrency(finalAmount * 100)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  Recurring fee (5%)
                  <span className="inline-block w-4 h-4 rounded-full border text-xs flex items-center justify-center">
                    i
                  </span>
                </span>
                <span>{formatCurrency(finalAmount * 0.05 * 100)}</span>
              </div>
            </div>

            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total due today</span>
              <span>{formatCurrency(finalAmount * 1.05 * 100)}</span>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground">
            By choosing the payment method above, you agree to a recurring{" "}
            <span className="font-semibold">{donationType === "monthly" ? "monthly" : "one-time"}</span> charge of{" "}
            <span className="font-semibold">{formatCurrency(finalAmount * 1.05 * 100)}</span> until it is canceled by
            you or us as per our Terms.
          </p>

          <Button
            size="lg"
            disabled={finalAmount <= 0 || isPending}
            onClick={handleContinue}
            className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {isPending ? "Loading..." : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
