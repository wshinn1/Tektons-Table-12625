import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { MarketingNav } from "@/components/marketing-nav"
import { getPageMetadata } from "@/lib/get-page-metadata"
import * as LucideIcons from "lucide-react"
import HeroCentered from "@/components/sections/hero-centered/hero-centered"
import { SectionRenderer } from "@/components/sections/section-renderer"
import { MarketingFooter } from "@/components/marketing-footer"
import dynamicImport from "next/dynamic"

const NewsletterSignup = dynamicImport(
  () => import("@/components/newsletter-signup").then((mod) => ({ default: mod.NewsletterSignup })),
  { ssr: true, loading: () => null },
)

export const dynamicRoute = "force-dynamic"

const iconMap: Record<string, any> = LucideIcons

async function getSiteContent(section: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("section", section)
      .eq("is_active", true)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching site content for ${section}:`, error)
      return null
    }

    return data?.content || null
  } catch (err) {
    console.error(`Exception fetching site content for ${section}:`, err)
    return null
  }
}

async function getHomepageSections() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*, section_templates(id, name, component_path, field_schema, default_props)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching homepage sections:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("Exception fetching homepage sections:", err)
    return []
  }
}

export async function generateMetadata() {
  return await getPageMetadata("homepage")
}

export default async function LandingPage() {
  const fetchWithTimeout = async (fn: () => Promise<any>, timeout = 1500) => {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
    try {
      return await Promise.race([fn(), timeoutPromise])
    } catch (err) {
      console.error("Content fetch timeout or error:", err)
      return null
    }
  }

  const [banner, sections] = await Promise.all([
    fetchWithTimeout(() => getSiteContent("announcement_banner")),
    fetchWithTimeout(() => getHomepageSections()),
  ])

  const heroSection = sections?.find((s: any) => s.section_type === "hero_section")
  const heroContent = heroSection?.content || {}

  const bannerContent = banner || { enabled: false }

  const featuresSection = sections?.find((s: any) => s.section_type === "features_grid")
  const pricingSection = sections?.find((s: any) => s.section_type === "pricing_comparison")
  const benefitsSection = sections?.find((s: any) => s.section_type === "benefits_columns")
  const ctaSection = sections?.find((s: any) => s.section_type === "cta")

  try {
    return (
      <div className="min-h-screen bg-background">
        {bannerContent.enabled && (
          <div className="bg-accent/10 border-b border-accent/20 py-2.5 text-center">
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-accent">New:</span> {bannerContent.text}{" "}
              <Link href={bannerContent.ctaLink || "/auth/signup"} className="text-accent hover:underline font-medium">
                {bannerContent.ctaText || "Get started"}
              </Link>
            </p>
          </div>
        )}

        <MarketingNav />

        <HeroCentered
          props={{
            heading: heroSection?.title || "Everything missionaries need to raise support",
            subheading:
              heroSection?.subtitle ||
              "Replace 4+ tools with one platform. Save thousands per year. Built specifically for support-raising missionaries.",
            buttonText: heroContent.primaryCTA || "Get Started Free",
            buttonLink: heroContent.primaryCTALink || "/auth/signup",
            buttonStyle: heroContent.buttonStyle || "solid",
            buttonColor: heroContent.buttonColor || "#FACC15",
            buttonTextColor: heroContent.buttonTextColor || "#1a1a1a",
            backgroundType:
              heroSection?.background_type === "video"
                ? "video"
                : heroSection?.background_type === "image"
                  ? "image"
                  : "gradient",
            backgroundImage: heroSection?.background_type === "image" ? heroSection?.background_value : "",
            videoUrl: heroSection?.background_type === "video" ? heroSection?.background_value : "",
            posterImage: heroContent.posterImage || "",
            gradientStart: heroContent.gradientStart || "#1e3a5f",
            gradientEnd: heroContent.gradientEnd || "#0f172a",
            gradientDirection: heroContent.gradientDirection || "to bottom",
            overlayColor: heroContent.overlayColor || "#000000",
            overlayOpacity: heroContent.overlayOpacity ?? 20,
            enableBlur: heroContent.enableBlur ?? true,
            blurIntensity: heroContent.blurIntensity ?? 30,
            textColor: heroContent.textColor || "#ffffff",
            headingFont: heroContent.headingFont || "italic-serif",
            minHeight: heroContent.minHeight || "100vh",
          }}
        />

        {sections?.map((section: any) => {
          if (section.source_type !== "built_in" || !section.section_templates?.component_path) {
            return null
          }

          return (
            <SectionRenderer
              key={section.id}
              template={{
                component_path: section.section_templates.component_path,
                name: section.section_templates.name,
              }}
              props={section.content || section.section_templates.default_props || {}}
              isVisible={section.is_active}
            />
          )
        })}

        {featuresSection && (
          <section
            className="py-20 px-6"
            style={{
              background:
                featuresSection.background_type === "color"
                  ? featuresSection.background_value
                  : featuresSection.background_type === "image"
                    ? `url(${featuresSection.background_value})`
                    : "transparent",
            }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{featuresSection.title}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">{featuresSection.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuresSection.content?.features?.map((feature: any, index: number) => {
                  const IconComponent = iconMap[feature.icon] || iconMap.Circle
                  return (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      {feature.badge && (
                        <span
                          className="inline-block text-sm font-medium px-3 py-1 rounded-full"
                          style={{ color: feature.badgeColor, backgroundColor: `${feature.badgeColor}20` }}
                        >
                          {feature.badge}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {pricingSection && (
          <section className="py-20 px-6" style={{ backgroundColor: pricingSection.background_value || "#ffffff" }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{pricingSection.title}</h2>
                <p className="text-xl text-gray-600">{pricingSection.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {pricingSection.content?.leftCard && (
                  <div
                    className="rounded-2xl p-8 border-2"
                    style={{
                      backgroundColor: pricingSection.content.leftCard.backgroundColor,
                      borderColor: pricingSection.content.leftCard.borderColor,
                    }}
                  >
                    <h3
                      className="text-2xl font-bold mb-2"
                      style={{ color: pricingSection.content.leftCard.titleColor }}
                    >
                      {pricingSection.content.leftCard.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{pricingSection.content.leftCard.subtitle}</p>

                    <div className="space-y-3 mb-6">
                      {pricingSection.content.leftCard.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="font-semibold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-gray-300 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg text-gray-900">Monthly Total</span>
                        <span className="font-bold text-lg text-gray-900">
                          {pricingSection.content.leftCard.monthlyTotal}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900">Annual Total</span>
                        <span
                          className="font-bold text-2xl"
                          style={{ color: pricingSection.content.leftCard.titleColor }}
                        >
                          {pricingSection.content.leftCard.annualTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {pricingSection.content?.rightCard && (
                  <div
                    className="rounded-2xl p-8 border-2 relative"
                    style={{
                      backgroundColor: pricingSection.content.rightCard.backgroundColor,
                      borderColor: pricingSection.content.rightCard.borderColor,
                    }}
                  >
                    {pricingSection.content.rightCard.badge && (
                      <div
                        className="absolute -top-4 right-8 px-4 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: pricingSection.content.rightCard.badgeColor,
                          color: "#ffffff",
                        }}
                      >
                        {pricingSection.content.rightCard.badge}
                      </div>
                    )}

                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{pricingSection.content.rightCard.title}</h3>
                    <p className="text-gray-600 mb-6">{pricingSection.content.rightCard.subtitle}</p>

                    <div className="space-y-3 mb-6">
                      {pricingSection.content.rightCard.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700">{item.label}</span>
                          {item.isCheck ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <span className="font-semibold text-gray-900">{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-gray-300 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg text-gray-900">Monthly Total</span>
                        <span
                          className="font-bold text-2xl"
                          style={{ color: pricingSection.content.rightCard.badgeColor }}
                        >
                          {pricingSection.content.rightCard.monthlyTotal}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg text-gray-900">Annual Total</span>
                        <span
                          className="font-bold text-2xl"
                          style={{ color: pricingSection.content.rightCard.badgeColor }}
                        >
                          {pricingSection.content.rightCard.annualTotal}
                        </span>
                      </div>

                      {pricingSection.content.rightCard.savings && (
                        <div
                          className="text-center py-3 rounded-lg"
                          style={{
                            backgroundColor: `${pricingSection.content.rightCard.badgeColor}30`,
                          }}
                        >
                          <div className="text-sm text-gray-600 mb-1">Annual Savings</div>
                          <div
                            className="text-2xl font-bold"
                            style={{ color: pricingSection.content.rightCard.badgeColor }}
                          >
                            {pricingSection.content.rightCard.savings}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {benefitsSection && (
          <section className="py-20 px-6" style={{ backgroundColor: benefitsSection.background_value || "#f9f9f9" }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{benefitsSection.title}</h2>
                <p className="text-xl text-gray-600">{benefitsSection.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-12">
                {benefitsSection.content?.benefits?.map((benefit: any, index: number) => {
                  const IconComponent = iconMap[benefit.icon] || iconMap.Circle
                  return (
                    <div key={index} className="text-center">
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{ backgroundColor: benefit.iconBgColor }}
                      >
                        <IconComponent className="w-8 h-8" style={{ color: benefit.iconColor }} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {ctaSection && (
          <section className="py-20 px-6" style={{ backgroundColor: ctaSection.background_value || "#f5f5f5" }}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{ctaSection.title}</h2>
              <p className="text-xl text-gray-600 mb-8">{ctaSection.subtitle}</p>

              <Link
                href={ctaSection.button_url || "/auth/signup"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold transition-transform hover:scale-105"
                style={{
                  backgroundColor: ctaSection.button_color || "#000000",
                  color: "#ffffff",
                }}
              >
                {ctaSection.button_text || "Get started for free"}
                <ArrowRight className="w-5 h-5" />
              </Link>

              {ctaSection.content?.supportingText && (
                <p className="text-sm text-gray-500 mt-6">{ctaSection.content.supportingText}</p>
              )}
            </div>
          </section>
        )}

        <MarketingFooter />
      </div>
    )
  } catch (error) {
    console.error("Error rendering homepage:", error)
    return <div>Error loading page</div>
  }
}
