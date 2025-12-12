import { createServerClient } from "@/lib/supabase/server"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import Link from "next/link"
import {
  Shield,
  Lock,
  CreditCard,
  Server,
  Eye,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Bell,
  Globe,
  FileCheck,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Security & Trust | Tektons Table",
  description:
    "Your donations are safe with bank-level security. Payment data processed by Stripe, never stored on our servers.",
}

const iconMap: Record<string, any> = {
  shield: Shield,
  lock: Lock,
  "credit-card": CreditCard,
  server: Server,
  eye: Eye,
  "check-circle": CheckCircle,
  database: Database,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "shield-alert": ShieldAlert,
  bell: Bell,
  globe: Globe,
  "file-check": FileCheck,
  "shield-check": ShieldCheck,
}

export default async function SecurityPage() {
  const supabase = await createServerClient()

  const { data: sections } = await supabase
    .from("security_sections")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (!sections || sections.length === 0) {
    return <div>No sections found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MarketingNav />

      {sections.map((section) => {
        switch (section.section_type) {
          case "hero":
            return (
              <section
                key={section.id}
                className={`py-20 ${section.background_type === "gradient" ? `bg-gradient-to-b ${section.background_value}` : ""}`}
                style={{
                  backgroundColor: section.background_type === "color" ? section.background_value : undefined,
                  color: section.text_color || undefined,
                }}
              >
                <div className="max-w-7xl mx-auto px-6 text-center">
                  {section.content.badge && (
                    <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-accent">{section.content.badge}</span>
                    </div>
                  )}
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                    {section.title?.split(section.content.highlightedWord || "")[0]}
                    {section.content.highlightedWord && (
                      <span style={{ color: section.content.highlightedColor }}>{section.content.highlightedWord}</span>
                    )}
                    {section.title?.split(section.content.highlightedWord || "")[1]}
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 text-pretty">{section.subtitle}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {section.content.primaryButton && (
                      <Button size="lg" asChild>
                        <Link href={section.content.primaryButton.url}>
                          {section.content.primaryButton.text} <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                    )}
                    {section.content.secondaryButton && (
                      <Button size="lg" variant="outline" asChild>
                        <Link href={section.content.secondaryButton.url}>{section.content.secondaryButton.text}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </section>
            )

          case "payment_flow":
            return (
              <section
                key={section.id}
                className="py-20"
                style={{
                  backgroundColor: section.background_type === "color" ? section.background_value : undefined,
                  color: section.text_color || undefined,
                }}
              >
                <div className="max-w-5xl mx-auto px-6">
                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 border-2">
                    <CardContent className="p-12 text-center">
                      <AlertTriangle className="w-16 h-16 text-accent mx-auto mb-6" />
                      <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                      <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">{section.subtitle}</p>
                      <div className="grid md:grid-cols-3 gap-6 text-left mt-8">
                        {section.content.steps?.map((step: any, i: number) => (
                          <div key={i} className="bg-background/50 rounded-xl p-6">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                              <span className="font-bold text-accent">{step.number}</span>
                            </div>
                            <h3 className="font-semibold mb-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )

          case "security_features":
            return (
              <section
                key={section.id}
                className="py-20"
                style={{
                  backgroundColor: section.background_type === "color" ? section.background_value : undefined,
                  color: section.text_color || undefined,
                }}
              >
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                    <p className="text-xl text-muted-foreground">{section.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.content.features?.map((feature: any, i: number) => {
                      const Icon = iconMap[feature.icon] || Shield
                      return (
                        <Card key={i} className="bg-card hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div
                              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                              style={{ backgroundColor: feature.iconBgColor }}
                            >
                              <Icon className="w-7 h-7" style={{ color: feature.iconColor }} />
                            </div>
                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </section>
            )

          case "stripe_integration":
            return (
              <section
                key={section.id}
                className="py-20"
                style={{
                  backgroundColor: section.background_type === "color" ? section.background_value : undefined,
                  color: section.text_color || undefined,
                }}
              >
                <div className="max-w-6xl mx-auto px-6">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                      {section.content.badge && (
                        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium text-accent">{section.content.badge}</span>
                        </div>
                      )}
                      <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                      <p className="text-lg text-muted-foreground mb-6">{section.subtitle}</p>
                      <ul className="space-y-3">
                        {section.content.features?.map((item: any, i: number) => {
                          const Icon = iconMap[item.icon] || CheckCircle
                          return (
                            <li key={i} className="flex items-start gap-2">
                              <Icon className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                              <span>{item.text}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                    <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-12 text-center">
                      <div className="text-6xl font-bold text-accent mb-4">stripe</div>
                      <p className="text-muted-foreground">Official Payment Partner</p>
                      {section.content.stats && (
                        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                          <div className="bg-background rounded-xl p-4">
                            <p className="text-2xl font-bold text-accent">{section.content.stats.processed}</p>
                            <p className="text-xs text-muted-foreground">{section.content.stats.processedLabel}</p>
                          </div>
                          <div className="bg-background rounded-xl p-4">
                            <p className="text-2xl font-bold text-accent">{section.content.stats.countries}</p>
                            <p className="text-xs text-muted-foreground">{section.content.stats.countriesLabel}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )

          case "certifications":
            return (
              <section
                key={section.id}
                className="py-20"
                style={{
                  backgroundColor: section.background_type === "color" ? section.background_value : undefined,
                  color: section.text_color || undefined,
                }}
              >
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                    <p className="text-xl text-muted-foreground">{section.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.content.certifications?.map((cert: any, i: number) => {
                      const Icon = iconMap[cert.icon] || CheckCircle
                      return (
                        <Card key={i} className="bg-card border-accent/20">
                          <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                              <p className="font-semibold">{cert.title}</p>
                              <p className="text-sm text-muted-foreground">{cert.subtitle}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </section>
            )

          case "data_control":
            return (
              <section
                key={section.id}
                className="py-20"
                style={{
                  backgroundColor: section.background_type === "color" ? section.background_value : undefined,
                  color: section.text_color || undefined,
                }}
              >
                <div className="max-w-5xl mx-auto px-6">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                    <p className="text-xl text-muted-foreground">{section.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-accent" />
                          {section.content.collect?.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {section.content.collect?.items?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-accent mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-accent" />
                          {section.content.dontCollect?.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {section.content.dontCollect?.items?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-accent mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mt-6 bg-accent/5 border-accent/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">{section.content.rights?.title}</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        {section.content.rights?.sections?.map((right: any, i: number) => (
                          <div key={i}>
                            <p className="font-medium mb-1">{right.title}</p>
                            <p className="text-muted-foreground">{right.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )

          case "cta":
            return (
              <section
                key={section.id}
                className="py-20 bg-gradient-to-b from-background to-accent/5"
                style={{
                  backgroundColor: section.background_type === "color" ? section.background_value : undefined,
                  color: section.text_color || undefined,
                }}
              >
                <div className="max-w-4xl mx-auto px-6 text-center">
                  <Shield className="w-16 h-16 text-accent mx-auto mb-6" />
                  <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{section.subtitle}</p>
                  <Button size="lg" asChild style={{ backgroundColor: section.content.buttonColor, color: "white" }}>
                    <Link href={section.content.buttonUrl}>
                      {section.content.buttonText} <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    {section.content.supportingText?.split(section.content.links?.[0]?.text)[0]}
                    {section.content.links?.map((link: any, i: number) => (
                      <span key={i}>
                        <Link href={link.url} className="text-accent hover:underline">
                          {link.text}
                        </Link>
                        {i < section.content.links.length - 1 && " or "}
                      </span>
                    ))}
                  </p>
                </div>
              </section>
            )

          default:
            return null
        }
      })}

      {/* Footer */}
      <MarketingFooter />
    </div>
  )
}
