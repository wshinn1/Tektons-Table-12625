import Link from "next/link"
import { ArrowRight, Heart, Globe, Camera, Users, Target } from "lucide-react"
import Image from "next/image"
import { MarketingNav } from "@/components/marketing-nav"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const iconMap: Record<string, any> = {
  heart: Heart,
  globe: Globe,
  camera: Camera,
  users: Users,
  target: Target,
}

async function getAboutSections() {
  try {
    const supabase = await createServerClient()
    const { data: sections } = await supabase
      .from("about_sections")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    return sections || []
  } catch (error) {
    console.error("[v0] Error fetching about sections:", error)
    return []
  }
}

function renderBackground(section: any) {
  if (section.background_type === "color") {
    return { backgroundColor: section.background_value }
  } else if (section.background_type === "image") {
    return {
      backgroundImage: `url(${section.background_value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  } else if (section.background_type === "video") {
    return {}
  }
  return {}
}

export default async function AboutPage() {
  const sections = await getAboutSections()

  const hero = sections.find((s) => s.section_type === "hero")
  const tektonOrigin = sections.find((s) => s.section_type === "tekton_origin")
  const founderProfile = sections.find((s) => s.section_type === "founder_profile")
  const personalValues = sections.find((s) => s.section_type === "personal_values")
  const missionStatement = sections.find((s) => s.section_type === "mission_statement")
  const cta = sections.find((s) => s.section_type === "cta")
  const tektonExplanation = sections.find((s) => s.section_type === "tekton_explanation")
  const profile = sections.find((s) => s.section_type === "profile")
  const factsGrid = sections.find((s) => s.section_type === "facts_grid")

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <MarketingNav />

      {/* Hero Section */}
      {hero && (
        <section className="relative py-20 md:py-32 overflow-hidden" style={renderBackground(hero)}>
          {hero.background_type === "video" && hero.background_value && (
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src={hero.background_value} type="video/mp4" />
            </video>
          )}
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h1
                className="text-5xl md:text-7xl font-bold mb-6 text-balance"
                style={{ color: hero.text_color || "#000" }}
              >
                {hero.title}
              </h1>
              <p
                className="text-xl mb-8 leading-relaxed text-pretty"
                style={{ color: hero.content?.subtitleColor || hero.text_color || "#666" }}
              >
                {hero.subtitle}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tekton Explanation Section */}
      {tektonExplanation && (
        <section className="py-20" style={renderBackground(tektonExplanation)}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{tektonExplanation.title}</h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed mb-6 whitespace-pre-line">{tektonExplanation.content.mainText}</p>

                <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-6 my-8">
                  <h3 className="text-2xl font-bold mb-4">{tektonExplanation.content.workshopTitle}</h3>
                  <p className="leading-relaxed whitespace-pre-line">{tektonExplanation.content.workshopText}</p>
                </div>

                <p
                  className="text-lg font-semibold text-center"
                  style={{ color: tektonExplanation.content.highlightedTextColor }}
                >
                  {tektonExplanation.content.highlightedText}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Origin Story Section */}
      {tektonOrigin && (
        <section className={`py-20 ${tektonOrigin.background_value}`}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{tektonOrigin.title}</h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed text-pretty">
                  {tektonOrigin.content.paragraph1}
                </p>

                <p className="text-lg text-muted-foreground mb-6 leading-relaxed text-pretty">
                  {tektonOrigin.content.paragraph2}
                </p>

                <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-6 my-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{tektonOrigin.content.workshop_title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {tektonOrigin.content.workshop_paragraph1}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">{tektonOrigin.content.workshop_paragraph2}</p>
                </div>

                <p
                  className="text-lg font-semibold text-center"
                  style={{ color: tektonOrigin.content.highlighted_text_color }}
                >
                  {tektonOrigin.content.highlighted_text}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Profile Section */}
      {profile && (
        <section className="py-20" style={renderBackground(profile)}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{profile.title}</h2>
                <p className="text-xl font-semibold mb-4" style={{ color: profile.content.subtitleColor }}>
                  {profile.content.subtitle}
                </p>

                <div className="space-y-4 leading-relaxed">
                  <p>{profile.content.paragraph1}</p>
                  <p>{profile.content.paragraph2}</p>
                  <p className="font-semibold pt-4">{profile.content.paragraph3}</p>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={profile.content.imageUrl || "/placeholder.svg"}
                    alt={profile.title || "Profile"}
                    width={600}
                    height={600}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Founder Section */}
      {founderProfile && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                  {founderProfile.title}
                </h2>
                <p className="text-xl font-semibold mb-4" style={{ color: founderProfile.content.subtitle_color }}>
                  {founderProfile.subtitle}
                </p>

                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>{founderProfile.content.paragraph1}</p>
                  <p>{founderProfile.content.paragraph2}</p>
                  <p className="text-foreground font-semibold pt-4">{founderProfile.content.paragraph3}</p>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={founderProfile.content.image_url || "/images/wes-shinn.jpg"}
                    alt={founderProfile.title || "Founder"}
                    width={600}
                    height={600}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Personal Values Section */}
      {personalValues && (
        <section className={`py-20 ${personalValues.background_value}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {personalValues.content.values?.map((value: any, index: number) => {
                const Icon = iconMap[value.icon] || Heart
                return (
                  <div key={index} className="bg-card border border-border rounded-xl p-8">
                    <div className={`w-12 h-12 rounded-lg ${value.iconBgColor} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" style={{ color: value.iconColor }} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Facts Grid Section */}
      {factsGrid && factsGrid.content.facts && (
        <section className="py-20" style={renderBackground(factsGrid)}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {factsGrid.content.facts.map((fact: any, index: number) => {
                const Icon = iconMap[fact.icon] || Heart
                return (
                  <div key={index} className="bg-card border border-border rounded-xl p-8">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: fact.iconBgColor }}
                    >
                      <Icon className="w-6 h-6" style={{ color: fact.iconColor }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{fact.title}</h3>
                    <p className="leading-relaxed">{fact.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mission Statement Section */}
      {missionStatement && (
        <section className="py-20" style={renderBackground(missionStatement)}>
          <div className="max-w-4xl mx-auto px-6">
            <div
              className="rounded-2xl p-12 text-center"
              style={{ backgroundColor: missionStatement.background_value }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: missionStatement.content.iconBgColor }}
              >
                <Users className="w-8 h-8" style={{ color: missionStatement.content.iconColor }} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">{missionStatement.title}</h2>
              <p className="text-lg leading-relaxed mb-6">{missionStatement.content.mainText}</p>
              <p className="text-xl font-semibold" style={{ color: missionStatement.content.highlightedTextColor }}>
                {missionStatement.content.highlightedText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {cta && (
        <section className="py-20" style={renderBackground(cta)}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{cta.title}</h2>
            <p className="text-xl mb-8 text-pretty">{cta.subtitle}</p>
            <Link
              href={cta.content.buttonUrl}
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl text-xl font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cta.content.buttonColor, color: "#ffffff" }}
            >
              {cta.content.buttonText}
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-sm mt-4">{cta.content.supportingText}</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Tekton's Table</h3>
              <p className="text-sm text-muted-foreground">Built by storytellers for storytellers in God's kingdom.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/example" className="text-sm text-muted-foreground hover:text-foreground">
                    Example
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-accent hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tekton's Table. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
