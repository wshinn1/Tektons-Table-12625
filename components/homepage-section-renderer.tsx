"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowRight, Check } from "lucide-react"
import * as LucideIcons from "lucide-react"

const iconMap: Record<string, any> = LucideIcons

const Prism = dynamic(() => import("@/components/backgrounds/prism"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900" />,
})

interface HomepageSectionRendererProps {
  sections: any[]
}

const getFontFamily = (fontType: string | undefined) => {
  switch (fontType) {
    case "serif":
      return "'Times New Roman', Georgia, serif"
    case "mono":
      return "'Courier New', monospace"
    case "sans-serif":
    default:
      return "inherit"
  }
}

export function HomepageSectionRenderer({ sections }: HomepageSectionRendererProps) {
  console.log("[v0] Rendering sections:", sections.length)

  const sortedSections = [...sections].sort((a, b) => {
    const orderA = a.display_order ?? a.section_order ?? 0
    const orderB = b.display_order ?? b.section_order ?? 0
    return orderA - orderB
  })

  console.log(
    "[v0] Sorted section orders:",
    sortedSections.map((s) => ({
      id: s.id,
      type: s.section_type,
      order: s.display_order ?? s.section_order,
    })),
  )

  return (
    <>
      {sortedSections.map((section, index) => {
        // Render screenshot section
        if (section.source_type === "screenshot" && section.content?.code) {
          return (
            <div key={section.id || index} className="w-full">
              <div dangerouslySetInnerHTML={{ __html: section.content.code }} />
            </div>
          )
        }

        // Render built-in sections
        switch (section.section_type) {
          case "hero":
          case "hero_section":
            const heroContent = section.content || {}
            const backgroundType = heroContent.backgroundType || section.background_type
            const videoUrl = heroContent.videoUrl || heroContent.backgroundUrl
            const backgroundImage = heroContent.backgroundImage || heroContent.backgroundUrl || section.background_value
            const overlayOpacity = heroContent.overlayOpacity ?? 40
            const overlayColor = heroContent.overlayColor || "#000000"

            // Check if this is the "Visual Story Telling" variant with dual headings
            const isVisualStorytellingHero = heroContent.heading && heroContent.heading2

            const isVideoBackground =
              backgroundType === "video" || backgroundType === "cdn" || (videoUrl && videoUrl.includes(".mp4"))

            return (
              <section
                key={section.id}
                className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
              >
                {/* Background: Video or Image */}
                {isVideoBackground && videoUrl ? (
                  <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                ) : backgroundType === "image" || backgroundImage ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${backgroundImage})`,
                      backgroundAttachment: heroContent.enableParallax ? "fixed" : undefined,
                    }}
                  />
                ) : backgroundType === "gradient" ? (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(${heroContent.gradientDirection || "to bottom right"}, ${heroContent.gradientStart || "#1e3a5f"}, ${heroContent.gradientEnd || "#0f172a"})`,
                    }}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: heroContent.backgroundColor || "#474747" }}
                  />
                )}

                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
                />

                {/* Top blur effect */}
                {heroContent.enableTopBlur && (
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
                )}

                {/* Bottom blur effect */}
                {heroContent.enableBottomBlur && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
                )}

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                  {isVisualStorytellingHero ? (
                    <>
                      <div
                        className="relative px-16 py-12 mx-auto"
                        style={{
                          border:
                            heroContent.showBorder !== false
                              ? `${heroContent.borderWidth || 1}px solid rgba(255, 255, 255, ${(heroContent.borderOpacity || 80) / 100})`
                              : "none",
                          borderColor: heroContent.borderColor
                            ? `rgba(${Number.parseInt(heroContent.borderColor.slice(1, 3), 16)}, ${Number.parseInt(heroContent.borderColor.slice(3, 5), 16)}, ${Number.parseInt(heroContent.borderColor.slice(5, 7), 16)}, ${(heroContent.borderOpacity || 80) / 100})`
                            : undefined,
                          maxWidth: "900px",
                        }}
                      >
                        <h1
                          className="text-5xl md:text-7xl mb-4"
                          style={{
                            color: heroContent.textColor || "#ffffff",
                            fontFamily:
                              heroContent.headingFont === "serif"
                                ? "'Caveat', 'Dancing Script', cursive"
                                : getFontFamily(heroContent.headingFont),
                            fontWeight: heroContent.headingFont === "serif" ? 400 : 700,
                          }}
                        >
                          {heroContent.heading}
                        </h1>

                        {/* Top decorative line */}
                        {heroContent.showDecorativeLines && (
                          <div className="flex justify-center my-4">
                            <div
                              style={{
                                width: heroContent.decorativeLineWidth || 80,
                                height: 2,
                                backgroundColor: heroContent.decorativeLineColor || "#ffffff",
                                opacity: (heroContent.borderOpacity || 80) / 100,
                              }}
                            />
                          </div>
                        )}

                        {heroContent.subheadingItalic && (
                          <p
                            className="text-2xl md:text-4xl italic my-4"
                            style={{
                              color: heroContent.textColor || "#ffffff",
                              fontFamily: getFontFamily(heroContent.subheadingFont || "serif"),
                            }}
                          >
                            {heroContent.subheadingItalic}
                          </p>
                        )}

                        {/* Second heading - bold sans-serif */}
                        <h2
                          className="text-4xl md:text-6xl font-bold mt-4"
                          style={{
                            color: heroContent.textColor || "#ffffff",
                            fontFamily: getFontFamily(heroContent.headingFont),
                          }}
                        >
                          {heroContent.heading2}
                        </h2>

                        {/* Bottom decorative line */}
                        {heroContent.showDecorativeLines && (
                          <div className="flex justify-center mt-6">
                            <div
                              style={{
                                width: heroContent.decorativeLineWidth || 80,
                                height: 2,
                                backgroundColor: heroContent.decorativeLineColor || "#ffffff",
                                opacity: (heroContent.borderOpacity || 80) / 100,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Standard Hero variant */}
                      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                        {heroContent.headline || section.title || "Welcome"}
                      </h1>
                      {(heroContent.subtitle || section.subtitle) && (
                        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                          {heroContent.subtitle || section.subtitle}
                        </p>
                      )}
                      {(heroContent.buttonText || section.button_text) && (
                        <Link
                          href={heroContent.buttonLink || section.button_url || "/auth/signup"}
                          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold transition-transform hover:scale-105"
                          style={{
                            backgroundColor: heroContent.buttonColor || "#FDB913",
                            color: "#000000",
                          }}
                        >
                          {heroContent.buttonText || section.button_text}
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </section>
            )

          case "About":
            const aboutContent = section.content || {}
            return (
              <section key={section.id} className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                  {/* Row 1: Text content on LEFT, Image on RIGHT */}
                  <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
                    {/* Left column: Label, Headline, body1, body2 */}
                    <div className="space-y-6">
                      {/* Label - small caps tracking */}
                      {aboutContent.label && (
                        <p className="text-sm font-semibold tracking-widest uppercase text-gray-900">
                          {aboutContent.label}
                        </p>
                      )}

                      {/* Headline - large serif-style */}
                      <h2 className="text-4xl md:text-5xl font-normal text-gray-900 leading-tight">
                        {aboutContent.headline || section.title || "About Us"}
                      </h2>

                      {/* Body paragraphs */}
                      {aboutContent.body1 && (
                        <p className="text-lg text-gray-600 leading-relaxed">{aboutContent.body1}</p>
                      )}
                      {aboutContent.body2 && (
                        <p className="text-lg text-gray-600 leading-relaxed">{aboutContent.body2}</p>
                      )}
                    </div>

                    {/* Right column: First media (image) */}
                    <div>
                      {aboutContent.media2_url && (
                        <div className="rounded-2xl overflow-hidden">
                          {aboutContent.media2_url.includes(".mp4") ? (
                            <video autoPlay loop muted playsInline className="w-full aspect-[3/4] object-cover">
                              <source src={aboutContent.media2_url} type="video/mp4" />
                            </video>
                          ) : (
                            <img
                              src={aboutContent.media2_url || "/placeholder.svg"}
                              alt="About visual"
                              className="w-full aspect-[3/4] object-cover"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Video on LEFT, body3 text on RIGHT */}
                  <div className="grid lg:grid-cols-2 gap-12 mb-12">
                    {/* Left column: Second media (video) */}
                    <div>
                      {aboutContent.media1_url && (
                        <div className="rounded-2xl overflow-hidden">
                          {aboutContent.media1_url.includes(".mp4") ? (
                            <video autoPlay loop muted playsInline className="w-full aspect-[4/3] object-cover">
                              <source src={aboutContent.media1_url} type="video/mp4" />
                            </video>
                          ) : (
                            <img
                              src={aboutContent.media1_url || "/placeholder.svg"}
                              alt="About visual"
                              className="w-full aspect-[4/3] object-cover"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-start">
                      {aboutContent.body3 && (
                        <p className="text-lg text-gray-600 leading-relaxed">{aboutContent.body3}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Centered button */}
                  {aboutContent.button_text && (
                    <div className="text-center">
                      <Link
                        href={aboutContent.button_url || "#"}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        {aboutContent.button_text}
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            )

          case "features_grid":
            const featuresContent = section.content || {}
            const hasBackgroundImage = section.background_type === "image" && section.background_value
            return (
              <section
                key={section.id}
                className="py-20 px-6"
                style={{
                  background: hasBackgroundImage
                    ? `url(${section.background_value})`
                    : section.background_type === "color"
                      ? section.background_value
                      : "transparent",
                  backgroundSize: hasBackgroundImage ? "cover" : undefined,
                  backgroundPosition: hasBackgroundImage ? "center" : undefined,
                  backgroundAttachment: hasBackgroundImage ? "fixed" : undefined,
                }}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">{section.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.content?.features?.map((feature: any, featureIndex: number) => {
                      const IconComponent = iconMap[feature.icon] || iconMap.Circle
                      return (
                        <div
                          key={featureIndex}
                          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
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
            )

          case "pricing_comparison":
            const pricingContent = section.content || {}
            return (
              <section
                key={section.id}
                className="py-20 px-6"
                style={{ backgroundColor: section.background_value || "#ffffff" }}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                      {pricingContent.headline || section.title}
                    </h2>
                    <p className="text-xl text-gray-600">{pricingContent.subheadline || section.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Traditional Approach Card */}
                    <div className="rounded-2xl p-8 border-2 bg-red-50 border-red-100 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                      <h3 className="text-2xl font-bold mb-2 text-red-600 text-center">
                        {pricingContent.currentStackTitle || "Traditional Approach"}
                      </h3>
                      <p className="text-gray-500 text-center mb-6">Paying for multiple tools separately</p>

                      <div className="space-y-4 mb-6">
                        {pricingContent.currentStackItems?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="font-semibold text-gray-900">{item.cost}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-900">Monthly Total</span>
                          <span className="font-bold text-gray-900">$135 - $256/mo</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Annual Total</span>
                          <span className="font-bold text-xl text-red-600">$1,620 - $3,072/yr</span>
                        </div>
                      </div>
                    </div>

                    {/* Tekton's Table Card */}
                    <div className="rounded-2xl p-8 border-2 bg-green-50 border-green-100 relative transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                      <div className="absolute -top-4 right-8 px-4 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
                        Best Value
                      </div>

                      <h3 className="text-2xl font-bold mb-2 text-green-600 text-center">
                        {pricingContent.platformTitle || "Tekton's Table"}
                      </h3>
                      <p className="text-gray-500 text-center mb-6">All-in-one missionary fundraising platform</p>

                      <div className="space-y-4 mb-6">
                        {pricingContent.platformItems?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-700">{item.name}</span>
                            {item.included ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <span className="font-semibold text-green-600">{item.cost}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-900">Monthly Total</span>
                          <span className="font-bold text-green-600">$0/mo</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-gray-900">Annual Total</span>
                          <span className="font-bold text-xl text-green-600">$0/yr</span>
                        </div>

                        <div className="text-center py-3 rounded-lg bg-green-100">
                          <div className="text-sm text-gray-600 mb-1">Annual Savings</div>
                          <div className="text-xl font-bold text-green-600">
                            {pricingContent.savingsAmount || "Save $1,620 - $3,072"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )

          case "benefits_columns":
            const benefitsContent = section.content || {}
            const benefits = benefitsContent.benefits || benefitsContent.features || []

            return (
              <section
                key={section.id}
                className="py-20 px-6"
                style={{
                  backgroundColor: benefitsContent.backgroundColor || section.background_value || "#f9fafb",
                }}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                      {section.title || benefitsContent.headline}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      {section.subtitle || benefitsContent.subheadline}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {benefits.map((benefit: any, benefitIndex: number) => {
                      const IconComponent = iconMap[benefit.icon] || iconMap.Circle
                      return (
                        <div
                          key={benefitIndex}
                          className="bg-white rounded-xl p-8 border border-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                        >
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                            style={{ backgroundColor: benefit.iconBgColor || "#fee2e2" }}
                          >
                            <IconComponent className="w-7 h-7" style={{ color: benefit.iconColor || "#ef4444" }} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )

          case "cta":
          case "cta_section":
            const ctaContent = section.content || {}
            return (
              <section
                key={section.id}
                className="py-24 px-6"
                style={{
                  backgroundColor: ctaContent.backgroundColorHex || section.background_value || "#F39C7F",
                }}
              >
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {section.title || ctaContent.headline}
                  </h2>
                  <p className="text-xl text-gray-800 mb-8">{section.subtitle || ctaContent.subheadline}</p>

                  <Link
                    href={ctaContent.ctaLink || section.button_url || "/auth/signup"}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold transition-transform hover:scale-105"
                    style={{
                      backgroundColor: ctaContent.buttonColor || section.button_color || "#1a1a1a",
                      color: ctaContent.buttonTextColor || "#ffffff",
                    }}
                  >
                    {section.button_text || ctaContent.ctaText || "Get Started Free"}
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  {(ctaContent.disclaimer || section.subtitle) && (
                    <p className="mt-6 text-sm text-gray-700">
                      {ctaContent.disclaimer || "No credit card required • Setup in 5 minutes • Cancel anytime"}
                    </p>
                  )}
                </div>
              </section>
            )

          case "animation_background_1":
            const animBgContent = section.content || {}
            const sectionHeight = animBgContent.sectionHeight || 600
            const animBgColor = section.background_value || animBgContent.backgroundColor || "#0a0a0a"

            return (
              <section
                key={section.id}
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  height: `${sectionHeight}px`,
                  backgroundColor: animBgColor,
                }}
              >
                {/* Prism Background */}
                <div className="absolute inset-0">
                  <Prism
                    animationType={animBgContent.animationType || "rotate"}
                    timeScale={animBgContent.timeScale ?? 0.5}
                    height={animBgContent.prismHeight ?? 3.5}
                    baseWidth={animBgContent.baseWidth ?? 5.5}
                    scale={animBgContent.scale ?? 3.6}
                    hueShift={animBgContent.hueShift ?? 0}
                    colorFrequency={animBgContent.colorFrequency ?? 1}
                    noise={animBgContent.noise ?? 0.5}
                    glow={animBgContent.glow ?? 1}
                    suspendWhenOffscreen={true}
                  />
                </div>

                {/* Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: animBgContent.overlayColor || "#000000",
                    opacity: (animBgContent.overlayOpacity ?? 30) / 100,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                    style={{ color: animBgContent.textColor || "#ffffff" }}
                  >
                    {animBgContent.headline || section.title || "Welcome"}
                  </h1>

                  {animBgContent.subheadline && (
                    <p
                      className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90"
                      style={{ color: animBgContent.textColor || "#ffffff" }}
                    >
                      {animBgContent.subheadline}
                    </p>
                  )}

                  {animBgContent.buttonText && (
                    <Link
                      href={animBgContent.buttonUrl || "#"}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: animBgContent.buttonColor || "#ffffff",
                        color: animBgContent.buttonTextColor || "#000000",
                      }}
                    >
                      {animBgContent.buttonText}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </section>
            )

          default:
            return null
        }
      })}
    </>
  )
}
