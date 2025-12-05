"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

export default function PricingComparison({ props }: { props: any }) {
  const {
    headline,
    subheadline,
    currentStackTitle = "What You Pay Now",
    currentStackItems,
    platformTitle = "Tektons Table",
    platformItems,
    savingsAmount,
    ctaText = "Start saving today",
    ctaLink = "/auth/signup",
  } = props

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{headline}</h2>
          {subheadline && <p className="text-xl text-muted-foreground text-pretty">{subheadline}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Current Cost */}
          <div className="bg-card border-2 border-red-200 dark:border-red-900 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{currentStackTitle}</h3>
              <p className="text-sm text-muted-foreground">Typical missionary stack</p>
            </div>
            <div className="space-y-4 mb-6">
              {currentStackItems?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Cost */}
          <div className="bg-accent/10 border-2 border-accent rounded-2xl p-8 relative">
            <div className="absolute -top-4 right-8 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Recommended
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">{platformTitle}</h3>
              <p className="text-sm text-muted-foreground">All-in-one platform</p>
            </div>
            <div className="space-y-4 mb-6">
              {platformItems?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.label}</span>
                  {item.checkmark ? (
                    <Check className="w-5 h-5 text-accent" />
                  ) : (
                    <span className={`font-semibold ${item.strikethrough ? "line-through text-muted-foreground" : ""}`}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {savingsAmount && (
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 text-center">
                <p className="text-sm font-semibold text-foreground">Annual Savings</p>
                <p className="text-3xl font-bold text-accent">{savingsAmount}</p>
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
