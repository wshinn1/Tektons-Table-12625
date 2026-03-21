// v1.0.0 - Homepage with cart merge and checkout improvements
import { MarketingNavClient } from "@/components/marketing-nav-client"
import { HomepageSectionRenderer } from "@/components/homepage-section-renderer"
import { MarketingFooter } from "@/components/marketing-footer"
import { createServerClient } from "@/lib/supabase/server"

const STATIC_NAV_ITEMS = [
  { id: "1", label: "About", url: "/about", position: 1, published: true, navigation_side: "left" },
  { id: "2", label: "How It Works", url: "/how-it-works", position: 2, published: true, navigation_side: "left" },
  { id: "3", label: "Pricing", url: "/pricing", position: 3, published: true, navigation_side: "left" },
  { id: "4", label: "Security", url: "/security", position: 4, published: true, navigation_side: "left" },
  { id: "5", label: "Blog", url: "/blog", position: 5, published: true, navigation_side: "left" },
  { id: "6", label: "Help", url: "/help", position: 6, published: true, navigation_side: "left" },
  { id: "7", label: "Support", url: "/support", position: 7, published: true, navigation_side: "left" },
]

const STATIC_NAV_SETTINGS = {
  logo_type: "text" as "text" | "image",
  logo_text: "Tekton's Table",
  logo_image_url: "/tektons-table-logo.png",
}

export default async function LandingPage() {
  const supabase = await createServerClient()

  // Fetch sections from database
  const { data: sections, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  console.log("[v0] Homepage sections fetched:", { count: sections?.length, error })

  // Use empty array if no sections found
  const displaySections = sections || []

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavClient menuItems={STATIC_NAV_ITEMS} navSettings={STATIC_NAV_SETTINGS} />
      <HomepageSectionRenderer sections={displaySections} />
      <MarketingFooter />
    </div>
  )
}
