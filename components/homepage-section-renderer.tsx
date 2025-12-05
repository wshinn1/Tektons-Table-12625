"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { BuilderSectionRenderer } from "@/components/builder/builder-section-renderer"

const iconMap: Record<string, any> = LucideIcons

interface HomepageSectionRendererProps {
  sections: any[]
}

export function HomepageSectionRenderer({ sections }: HomepageSectionRendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        // Render screenshot section
        if (section.source_type === "screenshot" && section.content?.code) {
          return (
            <div key={section.id || index} className="w-full">
              <div dangerouslySetInnerHTML={{ __html: section.content.code }} />
            </div>
          )
        }

        if (section.source_type === "builder_io" && section.builder_section_id) {
          return <BuilderSectionRenderer key={section.id || index} content={section.content} />
        }

        // Render built-in sections
        switch (section.section_type) {
          case "features_grid":
            return (
              <section
                key={section.id}
                className="py-20 px-6"
                style={{
                  background:
                    section.background_type === "color"
                      ? section.background_value
                      : section.background_type === "image"
                        ? `url(${section.background_value})`
                        : "transparent",
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
            return (
              <section
                key={section.id}
                className="py-20 px-6"
                style={{ backgroundColor: section.background_value || "#ffffff" }}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <p className="text-xl text-gray-600">{section.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {section.content?.leftCard && (
                      <div
                        className="rounded-2xl p-8 border-2"
                        style={{
                          backgroundColor: section.content.leftCard.backgroundColor,
                          borderColor: section.content.leftCard.borderColor,
                        }}
                      >
                        <h3 className="text-2xl font-bold mb-2" style={{ color: section.content.leftCard.titleColor }}>
                          {section.content.leftCard.title}
                        </h3>
                        <p className="text-gray-600 mb-6">{section.content.leftCard.subtitle}</p>

                        <div className="space-y-3 mb-6">
                          {section.content.leftCard.items?.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="flex justify-between items-center">
                              <span className="text-gray-700">{item.label}</span>
                              <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t-2 border-gray-300 pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg text-gray-900">Monthly Total</span>
                            <span className="font-bold text-lg text-gray-900">
                              {section.content.leftCard.monthlyTotal}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg text-gray-900">Annual Total</span>
                            <span className="font-bold text-2xl" style={{ color: section.content.leftCard.titleColor }}>
                              {section.content.leftCard.annualTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.content?.rightCard && (
                      <div
                        className="rounded-2xl p-8 border-2 relative"
                        style={{
                          backgroundColor: section.content.rightCard.backgroundColor,
                          borderColor: section.content.rightCard.borderColor,
                        }}
                      >
                        {section.content.rightCard.badge && (
                          <div
                            className="absolute -top-4 right-8 px-4 py-1 rounded-full text-sm font-semibold"
                            style={{
                              backgroundColor: section.content.rightCard.badgeColor,
                              color: "#ffffff",
                            }}
                          >
                            {section.content.rightCard.badge}
                          </div>
                        )}

                        <h3 className="text-2xl font-bold mb-2 text-gray-900">{section.content.rightCard.title}</h3>
                        <p className="text-gray-600 mb-6">{section.content.rightCard.subtitle}</p>

                        <div className="space-y-3 mb-6">
                          {section.content.rightCard.items?.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="flex justify-between items-center">
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
                              style={{ color: section.content.rightCard.badgeColor }}
                            >
                              {section.content.rightCard.monthlyTotal}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-lg text-gray-900">Annual Total</span>
                            <span
                              className="font-bold text-2xl"
                              style={{ color: section.content.rightCard.badgeColor }}
                            >
                              {section.content.rightCard.annualTotal}
                            </span>
                          </div>

                          {section.content.rightCard.savings && (
                            <div
                              className="text-center py-3 rounded-lg"
                              style={{
                                backgroundColor: `${section.content.rightCard.badgeColor}30`,
                              }}
                            >
                              <div className="text-sm text-gray-600 mb-1">Annual Savings</div>
                              <div
                                className="text-2xl font-bold"
                                style={{ color: section.content.rightCard.badgeColor }}
                              >
                                {section.content.rightCard.savings}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )

          case "benefits_columns":
            return (
              <section
                key={section.id}
                className="py-20 px-6"
                style={{ backgroundColor: section.background_value || "#f9f9f9" }}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <p className="text-xl text-gray-600">{section.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-12">
                    {section.content?.benefits?.map((benefit: any, benefitIndex: number) => {
                      const IconComponent = iconMap[benefit.icon] || iconMap.Circle
                      return (
                        <div key={benefitIndex} className="text-center">
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
            )

          case "cta":
            return (
              <section
                key={section.id}
                className="py-20 px-6"
                style={{ backgroundColor: section.background_value || "#f5f5f5" }}
              >
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <p className="text-xl text-gray-600 mb-8">{section.subtitle}</p>

                  <Link
                    href={section.button_url || "/auth/signup"}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold transition-transform hover:scale-105"
                    style={{
                      backgroundColor: section.button_color || "#000000",
                      color: "#ffffff",
                    }}
                  >
                    {section.button_text || "Get started for free"}
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  {section.content?.supportingText && (
                    <p className="text-sm text-gray-500 mt-6">{section.content.supportingText}</p>
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
