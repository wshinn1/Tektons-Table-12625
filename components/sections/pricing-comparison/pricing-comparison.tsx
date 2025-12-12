"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

export default function PricingComparison(props: any) {
  const {
    headline,
    subheadline,
    leftCard,
    rightCard,
    // Legacy props for backwards compatibility
    currentStackTitle = leftCard?.title || "What You Pay Now",
    currentStackItems = leftCard?.items,
    platformTitle = rightCard?.title || "Tektons Table",
    platformItems = rightCard?.items,
    savingsAmount = rightCard?.savings,
    ctaText = "Start saving today",
    ctaLink = "/auth/signup",
  } = props

  // If we have leftCard/rightCard from database, use that structure
  const useCardStructure = leftCard && rightCard

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {headline || "Save $1,620 - $3,072 per year"}
          </h2>
          {subheadline && <p className="text-xl text-muted-foreground text-pretty">{subheadline}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left Card / Current Cost */}
          <div
            className="border-2 rounded-2xl p-8"
            style={{
              backgroundColor: leftCard?.backgroundColor || "rgb(254, 242, 242)",
              borderColor: leftCard?.borderColor || "#fecaca",
            }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: leftCard?.titleColor || "#dc2626" }}>
                {currentStackTitle}
              </h3>
              <p className="text-sm text-muted-foreground">{leftCard?.subtitle || "Typical missionary stack"}</p>
            </div>
            <div className="space-y-4 mb-6">
              {currentStackItems?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
            {leftCard?.monthlyTotal && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">Monthly Total</span>
                  <span className="font-bold">{leftCard.monthlyTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Annual Total</span>
                  <span className="font-bold text-lg" style={{ color: leftCard.titleColor || "#dc2626" }}>
                    {leftCard.annualTotal}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Card / Platform Cost */}
          <div
            className="border-2 rounded-2xl p-8 relative"
            style={{
              backgroundColor: rightCard?.backgroundColor || "rgb(240, 253, 244)",
              borderColor: rightCard?.borderColor || "#bbf7d0",
            }}
          >
            {rightCard?.badge && (
              <div
                className="absolute -top-4 right-8 px-4 py-1 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: rightCard.badgeColor || "#16a34a" }}
              >
                {rightCard.badge}
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: rightCard?.titleColor || "#16a34a" }}>
                {platformTitle}
              </h3>
              <p className="text-sm text-muted-foreground">{rightCard?.subtitle || "All-in-one platform"}</p>
            </div>
            <div className="space-y-4 mb-6">
              {platformItems?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.label}</span>
                  {item.checkmark || item.isCheck ? (
                    <Check className="w-5 h-5" style={{ color: rightCard?.titleColor || "#16a34a" }} />
                  ) : (
                    <span className={`font-semibold ${item.strikethrough ? "line-through text-muted-foreground" : ""}`}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {rightCard?.monthlyTotal && (
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Monthly Total</span>
                  <span className="font-bold text-lg" style={{ color: rightCard.titleColor || "#16a34a" }}>
                    {rightCard.monthlyTotal}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Annual Total</span>
                  <span className="font-bold text-lg" style={{ color: rightCard.titleColor || "#16a34a" }}>
                    {rightCard.annualTotal}
                  </span>
                </div>
              </div>
            )}
            {savingsAmount && (
              <div
                className="mt-4 border rounded-lg p-4 text-center"
                style={{
                  backgroundColor: "rgba(187, 247, 208, 0.3)",
                  borderColor: rightCard?.borderColor || "#bbf7d0",
                }}
              >
                <p className="text-sm font-semibold text-foreground">Annual Savings</p>
                <p className="text-2xl font-bold" style={{ color: rightCard?.titleColor || "#16a34a" }}>
                  {savingsAmount}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
