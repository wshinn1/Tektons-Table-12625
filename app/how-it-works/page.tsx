import { createServerClient } from "@/lib/supabase/server"
import { MarketingNav } from "@/components/marketing-nav"
import { getPageMetadata } from "@/lib/get-page-metadata"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Check, Play, UserPlus, Palette, Send, DollarSign, BarChart3 } from "lucide-react"

export async function generateMetadata() {
  return await getPageMetadata("how-it-works")
}

const iconMap: Record<string, any> = {
  "user-plus": UserPlus,
  palette: Palette,
  send: Send,
  "dollar-sign": DollarSign,
  "bar-chart": BarChart3,
}

async function getHowItWorksSections() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("how_it_works_sections")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) {
    console.error("Error fetching how-it-works sections:", error)
    return []
  }

  return data || []
}

export default async function HowItWorksPage() {
  const sections = await getHowItWorksSections()

  console.log(
    "[v0] How It Works sections:",
    JSON.stringify(
      sections
        .filter((s) => s.section_type === "hero")
        .map((s) => ({
          id: s.id,
          content: s.content,
          text_color: s.text_color,
        })),
      null,
      2,
    ),
  )

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {sections.map((section) => {
        // Hero Section
        if (section.section_type === "hero") {
          const content = (section.content || {}) as any

          console.log("[v0] Hero content:", content)
          console.log("[v0] subtitleColor:", content.subtitleColor)
          console.log("[v0] showSecondaryButton:", content.showSecondaryButton)

          const backgroundStyle =
            section.background_type === "color" || section.background_type === "gradient"
              ? { background: section.background_value }
              : section.background_type === "image"
                ? {
                    backgroundImage: `url(${section.background_value})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}

          const isDarkBackground = section.background_type === "video" || section.background_type === "image"
          const defaultTextColor = isDarkBackground ? "#ffffff" : "#000000"
          const defaultSubtitleColor = isDarkBackground ? "#e0e0e0" : "#666666"

          return (
            <section key={section.id} className="py-20 relative overflow-hidden" style={backgroundStyle}>
              {section.background_type === "video" && (
                <>
                  <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src={section.background_value || ""} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/40" />
                </>
              )}
              <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                  <Play className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">{content.badge}</span>
                </div>
                <h1
                  className="text-5xl md:text-6xl font-bold mb-6 text-balance"
                  style={{ color: content.titleColor || section.text_color || defaultTextColor }}
                >
                  {section.title?.replace(content.highlightedWord, "")}
                  <span style={{ color: content.highlightedColor }}>{content.highlightedWord}</span>
                </h1>
                <p
                  className="text-xl max-w-3xl mx-auto mb-8 text-pretty"
                  style={{ color: content.subtitleColor || defaultSubtitleColor }}
                >
                  {section.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    asChild
                    style={{
                      backgroundColor: content.primaryButtonBg || undefined,
                      color: content.primaryButtonColor || undefined,
                    }}
                  >
                    <Link href={content.primaryButton?.url || "/auth/signup"}>
                      {content.primaryButton?.text || "Get Started"} <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  {content.showSecondaryButton === true && content.secondaryButton?.text && (
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      <Link href={content.secondaryButton.url}>{content.secondaryButton.text}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )
        }

        // Steps Timeline Section
        if (section.section_type === "steps_timeline") {
          const content = section.content as any
          return (
            <section
              key={section.id}
              className="py-20"
              style={{ backgroundColor: section.background_value, color: section.text_color || "#000" }}
            >
              <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                  <p className="text-xl text-muted-foreground">{section.subtitle}</p>
                </div>

                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-accent/20 hidden md:block" />

                  <div className="space-y-12">
                    {content.steps.map((step: any, i: number) => {
                      const Icon = iconMap[step.icon] || UserPlus
                      return (
                        <div key={i} className="relative">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0 relative">
                              <div
                                className="w-16 h-16 rounded-full flex items-center justify-center relative z-10"
                                style={{ backgroundColor: step.iconBgColor }}
                              >
                                <Icon className="w-5 h-5" style={{ color: "#fff" }} />
                              </div>
                              <div
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 flex items-center justify-center font-bold text-sm z-20"
                                style={{ borderColor: step.iconColor, color: step.iconColor }}
                              >
                                {step.number}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold">{step.title}</h3>
                                <span className="text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded-full">
                                  {step.time}
                                </span>
                              </div>
                              <p className="text-lg text-muted-foreground mb-4">{step.description}</p>
                              <Card className="bg-accent/5 border-accent/20">
                                <CardContent className="p-4">
                                  <ul className="space-y-2">
                                    {step.details.map((detail: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                        <span>{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div
                  className="text-center mt-16 p-8 rounded-2xl border border-accent/20"
                  style={{
                    background: `linear-gradient(to bottom right, ${content.totalTimeBg}10, ${content.totalTimeBg}05)`,
                  }}
                >
                  <p className="text-sm text-muted-foreground mb-2">Total Setup Time</p>
                  <p className="text-5xl font-bold mb-2" style={{ color: content.steps[0].iconColor }}>
                    {content.totalTime}
                  </p>
                  <p className="text-muted-foreground">{content.totalTimeSubtitle}</p>
                </div>
              </div>
            </section>
          )
        }

        // Video Section
        if (section.section_type === "video") {
          const content = section.content as any
          return (
            <section
              key={section.id}
              className="py-20"
              style={{ backgroundColor: section.background_value, color: section.text_color || "#000" }}
            >
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                  <p className="text-xl text-muted-foreground">{section.subtitle}</p>
                </div>

                <div
                  className="relative rounded-2xl overflow-hidden border-2 border-accent/20 aspect-video flex items-center justify-center"
                  style={{ backgroundColor: content.placeholderBg }}
                >
                  <div className="text-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: content.iconBgColor }}
                    >
                      <Play className="w-10 h-10 text-accent-foreground ml-1" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">{content.videoTitle}</p>
                    <p className="text-muted-foreground">{content.videoSubtitle}</p>
                  </div>
                </div>
              </div>
            </section>
          )
        }

        // Features Grid Section
        if (section.section_type === "features_grid") {
          const content = section.content as any
          return (
            <section
              key={section.id}
              className="py-20"
              style={{ backgroundColor: section.background_value, color: section.text_color || "#000" }}
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                  <p className="text-xl text-muted-foreground">{section.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {content.features.map((feature: any, i: number) => (
                    <Card key={i} className="bg-card hover:bg-accent/5 transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: feature.iconColor }} />
                        <span className="font-medium">{feature.text}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        // FAQ Section
        if (section.section_type === "faq") {
          const content = section.content as any
          return (
            <section
              key={section.id}
              className="py-20"
              style={{ backgroundColor: section.background_value, color: section.text_color || "#000" }}
            >
              <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {content.faqs.map((faq: any, i: number) => (
                    <details key={i} className="group bg-card rounded-xl p-6 border">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                        <svg
                          className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="mt-4 text-muted-foreground">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        // CTA Section
        if (section.section_type === "cta") {
          const content = section.content as any
          return (
            <section
              key={section.id}
              className="py-20"
              style={{ backgroundColor: section.background_value, color: section.text_color || "#000" }}
            >
              <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                <p className="text-xl text-muted-foreground mb-8">{section.subtitle}</p>
                <Button size="lg" asChild style={{ backgroundColor: content.buttonColor }}>
                  <Link href={content.buttonUrl}>
                    {content.buttonText} <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-4">{content.supportingText}</p>
              </div>
            </section>
          )
        }

        return null
      })}

      {/* Footer */}
      <footer className="border-t bg-accent/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Tekton's Table</h3>
              <p className="text-sm text-muted-foreground">Free fundraising platform for missionaries worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-muted-foreground hover:text-foreground">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Tekton's Table. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
