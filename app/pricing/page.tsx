import Link from "next/link"
import {
  ArrowRight,
  Shield,
  CreditCard,
  Lock,
  Database,
  Eye,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Bell,
  Globe,
  FileCheck,
  ShieldCheck,
  TrendingDown,
  X,
  Check,
} from "lucide-react"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { createServerClient } from "@/lib/supabase/server"
import { getPageMetadata } from "@/lib/get-page-metadata"
import { OptimizedVideo } from "@/components/optimized-video"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return await getPageMetadata("pricing")
}

const iconMap: Record<string, any> = {
  shield: Shield,
  "credit-card": CreditCard,
  lock: Lock,
  database: Database,
  eye: Eye,
  "check-circle": CheckCircle,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "shield-alert": ShieldAlert,
  bell: Bell,
  globe: Globe,
  "file-check": FileCheck,
  "shield-check": ShieldCheck,
}

function renderBackground(section: any) {
  if (section.background_type === "color") {
    // Check if it's a hex color or Tailwind class
    if (section.background_value?.startsWith("#")) {
      return { backgroundColor: section.background_value }
    }
    return {} // Will use className instead
  } else if (section.background_type === "gradient") {
    return {} // Will use className instead
  }
  return {}
}

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
}

function getBackgroundClass(section: any) {
  if (section.background_type === "color" && !section.background_value?.startsWith("#")) {
    return section.background_value
  } else if (section.background_type === "gradient") {
    return `bg-gradient-to-b ${section.background_value}`
  }
  return ""
}

function getImageBackgroundStyle(section: any) {
  if (section.background_type === "image" && section.background_value) {
    return {
      backgroundImage: `url(${section.background_value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  }
  return {}
}

export default async function PricingPage() {
  const supabase = await createServerClient()

  const { data: sections = [] } = await supabase
    .from("pricing_sections")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  const hero = sections.find((s) => s.section_type === "hero")
  const costCalculator = sections.find((s) => s.section_type === "cost_calculator")
  const platformComparison = sections.find((s) => s.section_type === "platform_comparison")
  const savings = sections.find((s) => s.section_type === "savings")
  const missionAgency = sections.find((s) => s.section_type === "mission_agency")
  const finalCta = sections.find((s) => s.section_type === "cta")

  if (hero) {
    console.log("[v0] Pricing hero data:", {
      background_type: hero.background_type,
      background_value: hero.background_value,
      text_color: hero.text_color,
      subtitleColor: hero.content?.subtitleColor,
    })
  }

  const heroHasMediaBackground =
    hero && (hero.background_type === "video" || hero.background_type === "image") && hero.background_value
  const heroTitleColor = hero?.text_color || (heroHasMediaBackground ? "#ffffff" : "#1a1a1a")
  const heroSubtitleColor =
    hero?.content?.subtitleColor || (heroHasMediaBackground ? "rgba(255,255,255,0.9)" : "#666666")

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero Section */}
      {hero && (
        <section
          className={`relative py-20 md:py-32 overflow-hidden ${getBackgroundClass(hero)}`}
          style={{ ...renderBackground(hero), ...getImageBackgroundStyle(hero) }}
        >
          {(hero.background_type === "video" || isVideoUrl(hero.background_value)) && hero.background_value && (
            <OptimizedVideo src={hero.background_value} fallbackBg="#1a1a2e" />
          )}

          {heroHasMediaBackground && <div className="absolute inset-0 bg-black/40" />}

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            {hero.content?.badge && (
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">{hero.content.badge}</span>
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance" style={{ color: heroTitleColor }}>
              {hero.title?.split(hero.content?.highlightedWord || "").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{ color: hero.content?.highlightedColor || "#f5a390" }}>
                      {hero.content?.highlightedWord}
                    </span>
                  )}
                </span>
              ))}
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8 text-pretty" style={{ color: heroSubtitleColor }}>
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hero.content?.primaryButton && (
                <Link
                  href={hero.content.primaryButton.url}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  {hero.content.primaryButton.text}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              {hero.content?.secondaryButton && hero.content?.showSecondaryButton === true && (
                <Link
                  href={hero.content.secondaryButton.url}
                  className="inline-flex items-center gap-2 bg-background border-2 border-foreground text-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-foreground hover:text-background transition-colors"
                >
                  {hero.content.secondaryButton.text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Cost Calculator Section */}
      {costCalculator && (
        <section className="py-20" style={{ backgroundColor: costCalculator.background_value || "#ffffff" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{costCalculator.title}</h2>
              <p className="text-xl text-muted-foreground">{costCalculator.subtitle}</p>
            </div>

            <div className="bg-card border-2 border-border rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {costCalculator.content?.donations?.map((amount: number) => (
                  <div key={amount} className="text-center">
                    <div className="text-3xl font-bold mb-4">${amount.toLocaleString()}</div>
                    <div className="space-y-2">
                      {costCalculator.content?.platforms?.map((platform: any) => {
                        const netAmount = platform.fixedFee
                          ? amount - amount * platform.rate - platform.fixedFee
                          : amount - amount * platform.rate
                        return (
                          <div
                            key={platform.name}
                            className="py-2 px-3 rounded-lg"
                            style={{
                              backgroundColor: platform.name === "TektonStable" ? `${platform.color}20` : "#f3f4f6",
                            }}
                          >
                            <div
                              className="text-sm font-semibold mb-1"
                              style={{ color: platform.name === "TektonStable" ? platform.color : "#1f2937" }}
                            >
                              {platform.name}
                            </div>
                            <div className="text-lg font-bold">${netAmount.toFixed(2)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {costCalculator.content?.note && (
                <p className="text-sm text-muted-foreground text-center">{costCalculator.content.note}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Platform Comparison Section */}
      {platformComparison && (
        <section className="py-20" style={{ backgroundColor: platformComparison.background_value || "#ffffff" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{platformComparison.title}</h2>
              <p className="text-xl text-muted-foreground">{platformComparison.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformComparison.content?.platforms?.map((platform: any, index: number) => (
                <div
                  key={index}
                  className={`bg-card border-2 rounded-2xl p-6 relative ${
                    platform.badge ? "border-accent" : "border-border"
                  }`}
                >
                  {platform.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-background px-4 py-1 rounded-full text-sm font-semibold">
                      {platform.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent font-bold">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Platform: {platform.platformFee} | Monthly: {platform.monthlyFee}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Total on $100 donation:</p>
                    <p className="text-2xl font-bold text-accent">{platform.totalOnHundred}</p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {platform.pros?.map((pro: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{pro}</span>
                      </div>
                    ))}
                  </div>

                  {platform.cons && platform.cons.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      {platform.cons.map((con: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{con}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {platform.buttonText && (
                    <Link
                      href={platform.buttonUrl}
                      className="mt-6 w-full flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                      {platform.buttonText}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Savings Section */}
      {savings && (
        <section className="py-20" style={{ backgroundColor: savings.background_value || "#ffffff" }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <TrendingDown className="w-16 h-16 text-accent mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{savings.title}</h2>
              <p className="text-xl text-muted-foreground">{savings.subtitle}</p>
            </div>

            <div className="bg-card border-2 border-border rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-center p-6 bg-muted rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-2">{savings.content?.oldMonthlyCostLabel}</p>
                  <p className="text-4xl font-bold text-red-600">{savings.content?.oldMonthlyCost}</p>
                </div>
                <div className="text-center p-6 bg-accent/10 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-2">{savings.content?.tektonStableMonthlyCostLabel}</p>
                  <p className="text-4xl font-bold text-accent">{savings.content?.tektonStableMonthlyCost}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Annual Savings</p>
                <p className="text-5xl font-bold text-accent mb-6">{savings.content?.annualSavings}</p>
                {savings.content?.buttonText && (
                  <Link
                    href={savings.content.buttonUrl}
                    className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    {savings.content.buttonText}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission Agency Section */}
      {missionAgency && (
        <section className="py-20" style={{ backgroundColor: missionAgency.background_value || "#f9f9f9" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{missionAgency.title}</h2>
              <p className="text-xl text-muted-foreground">{missionAgency.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {missionAgency.content?.agencies?.map((agency: any, index: number) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">{agency.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Fees: {agency.fees}</p>
                  <ul className="space-y-2">
                    {agency.cons?.map((con: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Complement Section */}
            <div className="bg-accent/5 border-2 border-accent/20 rounded-3xl p-8 md:p-12">
              <h3 className="text-3xl font-bold text-center mb-8">{missionAgency.content?.complement?.title}</h3>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="w-6 h-6 text-accent" />
                    <h4 className="text-xl font-bold">What TektonStable Provides</h4>
                  </div>
                  <ul className="space-y-2">
                    {missionAgency.content?.complement?.tektonStableProvides?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="w-6 h-6 text-accent" />
                    <h4 className="text-xl font-bold">What Your Agency Provides</h4>
                  </div>
                  <ul className="space-y-2">
                    {missionAgency.content?.complement?.agencyProvides?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {missionAgency.content?.complement?.note && (
                <p className="text-center text-muted-foreground italic">{missionAgency.content.complement.note}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      {finalCta && (
        <section className="py-20" style={{ backgroundColor: finalCta.background_value }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <DollarSign className="w-16 h-16 text-accent mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{finalCta.title}</h2>
            <p className="text-xl text-muted-foreground mb-8">{finalCta.subtitle}</p>
            {finalCta.content?.buttonText && (
              <Link
                href={finalCta.content.buttonUrl}
                className="inline-flex items-center gap-2 px-10 py-5 rounded-xl text-xl font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: finalCta.content.buttonColor, color: "#ffffff" }}
              >
                {finalCta.content.buttonText}
                <ArrowRight className="w-6 h-6" />
              </Link>
            )}
            {finalCta.content?.supportingText && (
              <p className="text-sm text-muted-foreground mt-6">
                {finalCta.content.supportingText}{" "}
                {finalCta.content?.links?.map((link: any, index: number) => (
                  <span key={index}>
                    <Link href={link.url} className="text-accent hover:underline">
                      {link.text}
                    </Link>
                    {index < finalCta.content.links.length - 1 && " or "}
                  </span>
                ))}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <MarketingFooter />
    </div>
  )
}
