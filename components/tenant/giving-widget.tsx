"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, TrendingUp, X, Heart } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/donation-tiers"
import { cn } from "@/lib/utils"

interface GivingWidgetProps {
  subdomain: string
  raisedAmount: number
  goalAmount: number
  donationCount: number
  showDonorNames?: boolean
  recentDonors?: Array<{
    name: string
    amount: number
    timeAgo: string
  }>
  compact?: boolean
}

export function GivingWidget({
  subdomain,
  raisedAmount,
  goalAmount,
  donationCount,
  showDonorNames = false,
  recentDonors = [],
  compact = false,
}: GivingWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentRaised, setCurrentRaised] = useState(0)
  const [currentCount, setCurrentCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const raised = Number(currentRaised) || 0
  const goal = Number(goalAmount) || 5000
  const count = Number(currentCount) || 0

  const progressPercent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On desktop, start expanded. On mobile, start minimized.
      if (!mobile) {
        setIsMinimized(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const timestamp = Date.now()
        const response = await fetch(`/api/tenant/giving/stats?subdomain=${subdomain}&t=${timestamp}`, {
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()

          if (!hasLoadedOnce) {
            setHasLoadedOnce(true)
          }

          if (data.totalRaised !== undefined) {
            setCurrentRaised(data.totalRaised)
          }
          if (data.donationCount !== undefined) {
            setCurrentCount(data.donationCount)
          }
        }
      } catch (error) {
        console.error("GivingWidget - Fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    const pollInterval = setInterval(fetchStats, 10000)

    return () => clearInterval(pollInterval)
  }, [subdomain, hasLoadedOnce])

  if (isLoading && !hasLoadedOnce) {
    if (isMobile) {
      return (
        <div className="fixed top-20 right-4 z-50">
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg animate-pulse">
            <Heart className="h-5 w-5" />
          </div>
        </div>
      )
    }
    return (
      <div className="sticky top-4 w-full">
        <Card className={cn("overflow-hidden border-2 shadow-lg", compact ? "p-4" : "p-6")}>
          <div className={cn("flex justify-center items-center", compact ? "h-32" : "h-48")}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    )
  }

  if (isMinimized && isMobile) {
    return (
      <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="shadow-xl gap-2 rounded-full px-4 py-6 bg-primary hover:bg-primary/90"
          aria-label="Expand giving widget"
        >
          <Heart className="h-5 w-5 fill-current" />
          <span className="font-semibold">{Math.round(progressPercent)}% funded</span>
        </Button>
      </div>
    )
  }

  if (isMinimized && !isMobile) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
        <Button
          onClick={() => setIsMinimized(false)}
          size={compact ? "default" : "lg"}
          className="shadow-lg gap-2"
          aria-label="Expand giving widget"
        >
          <Heart className="h-4 w-4 fill-current" />
          <span className="font-semibold">{Math.round(progressPercent)}% funded</span>
        </Button>
      </div>
    )
  }

  if (isMobile && !isMinimized) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setIsMinimized(true)}
        />

        {/* Widget Card */}
        <div className="fixed inset-x-4 bottom-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <Card className="overflow-hidden border-2 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
              aria-label="Close widget"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-5 space-y-4">
              {/* Progress circle */}
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPercent / 100)}`}
                      className="text-primary transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">{formatCurrency(raised * 100)} raised</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(goal * 100)} goal · {count} {count === 1 ? "donation" : "donations"}
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Button asChild size="lg" className="w-full font-semibold">
                  <Link href="/giving">Donate now</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>

              {/* Recent activity */}
              {count > 0 && (
                <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 rounded-lg p-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{count} people have donated</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </>
    )
  }

  // Desktop expanded view (original)
  return (
    <div className="sticky top-4 w-full animate-in slide-in-from-right-4 duration-300">
      <Card className={cn("overflow-hidden border-2 shadow-lg", compact && "text-sm")}>
        <button
          onClick={() => setIsMinimized(true)}
          className={cn(
            "absolute top-2 right-2 z-10 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
            compact && "text-xs px-2 py-0.5",
          )}
          aria-label="Minimize widget"
        >
          Hide
        </button>

        <div className={cn("space-y-3", compact ? "p-4" : "p-6")}>
          <div className="flex justify-center">
            <div className={cn("relative", compact ? "w-20 h-20" : "w-24 h-24")}>
              <svg className={cn("transform -rotate-90", compact ? "w-20 h-20" : "w-24 h-24")}>
                <circle
                  cx={compact ? "40" : "48"}
                  cy={compact ? "40" : "48"}
                  r={compact ? "32" : "40"}
                  stroke="currentColor"
                  strokeWidth={compact ? "6" : "8"}
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx={compact ? "40" : "48"}
                  cy={compact ? "40" : "48"}
                  r={compact ? "32" : "40"}
                  stroke="currentColor"
                  strokeWidth={compact ? "6" : "8"}
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * (compact ? 32 : 40)}`}
                  strokeDashoffset={`${2 * Math.PI * (compact ? 32 : 40) * (1 - progressPercent / 100)}`}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>{formatCurrency(raised * 100)} raised</h3>
            <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
              {formatCurrency(goal * 100)} goal · {count} {count === 1 ? "donation" : "donations"}
            </p>
          </div>

          <div className="space-y-2">
            <Button asChild size={compact ? "default" : "lg"} className="w-full font-semibold">
              <Link href="/giving">Donate now</Link>
            </Button>
            <Button asChild size={compact ? "default" : "lg"} variant="secondary" className="w-full">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {recentDonors.length > 0 && (
            <div
              className={cn(
                "flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 rounded-lg",
                compact ? "text-xs p-1.5" : "text-sm p-2",
              )}
            >
              <TrendingUp className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              <span className="font-medium">{count} people just donated</span>
            </div>
          )}
        </div>

        {showDonorNames && recentDonors.length > 0 && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full border-t flex items-center justify-between hover:bg-muted/50 transition-colors",
                compact ? "px-4 py-2" : "px-6 py-3",
              )}
            >
              <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>Recent donations</span>
              {isExpanded ? (
                <ChevronUp className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              ) : (
                <ChevronDown className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              )}
            </button>

            <div
              className={cn(
                "border-t overflow-hidden transition-all duration-300",
                isExpanded ? "max-h-96" : "max-h-0",
              )}
            >
              <div className={cn("space-y-2 max-h-80 overflow-y-auto", compact ? "p-3" : "p-4")}>
                {recentDonors.map((donor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div
                      className={cn(
                        "rounded-full bg-muted flex items-center justify-center flex-shrink-0",
                        compact ? "w-8 h-8" : "w-10 h-10",
                      )}
                    >
                      <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{donor.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium truncate", compact ? "text-xs" : "text-sm")}>{donor.name}</p>
                      <p className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
                        <span className="font-semibold">{formatCurrency(donor.amount * 100)}</span> · {donor.timeAgo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
