import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { MarketingNav } from "@/components/marketing-nav"
import { getPageMetadata } from "@/lib/get-page-metadata"
import { SectionRenderer } from "@/components/sections/section-renderer"
import { MarketingFooter } from "@/components/marketing-footer"

export const dynamic = "force-dynamic"

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
  const [banner, sections] = await Promise.all([getSiteContent("announcement_banner"), getHomepageSections()])

  const heroSection = sections?.find((s: any) => s.section_type === "hero_section")
  const nonHeroSections = sections?.filter((s: any) => s.section_type !== "hero_section") || []

  const bannerContent = banner || { enabled: false }

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

        {heroSection && heroSection.section_templates?.component_path && (
          <SectionRenderer
            template={{
              component_path: heroSection.section_templates.component_path,
              name: heroSection.section_templates.name,
            }}
            props={heroSection.content || heroSection.section_templates.default_props || {}}
            isVisible={heroSection.is_active}
          />
        )}

        {nonHeroSections.map((section: any) => {
          if (!section.section_templates?.component_path) {
            console.warn(`Section ${section.id} has no component_path`)
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

        <MarketingFooter />
      </div>
    )
  } catch (error) {
    console.error("Error rendering homepage:", error)
    return <div>Error loading page</div>
  }
}
