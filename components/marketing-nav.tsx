import { getPublishedMenuItems, getNavigationSettings } from "@/app/actions/menu"
import { MarketingNavClient } from "./marketing-nav-client"
import { cache } from "react"

const getCachedMenuItems = cache(async () => {
  return await getPublishedMenuItems()
})

const getCachedNavSettings = cache(async () => {
  return await getNavigationSettings()
})

export async function MarketingNav() {
  let menuItems = []
  let navSettings = null

  try {
    const [fetchedMenuItems, fetchedNavSettings] = await Promise.all([getCachedMenuItems(), getCachedNavSettings()])
    menuItems = fetchedMenuItems
    navSettings = fetchedNavSettings
  } catch (error) {
    console.error("[v0] MarketingNav: Error fetching data:", error)
  }

  // Fallback to defaults if no items in DB
  const items =
    menuItems && menuItems.length > 0
      ? menuItems
      : [
          { id: "1", label: "About", url: "/about", position: 1, published: true, navigation_side: "left" as const },
          {
            id: "2",
            label: "How It Works",
            url: "/how-it-works",
            position: 2,
            published: true,
            navigation_side: "left" as const,
          },
          {
            id: "3",
            label: "Pricing",
            url: "/pricing",
            position: 3,
            published: true,
            navigation_side: "left" as const,
          },
          {
            id: "4",
            label: "Security",
            url: "/security",
            position: 4,
            published: true,
            navigation_side: "left" as const,
          },
          { id: "5", label: "Blog", url: "/blog", position: 5, published: true, navigation_side: "left" as const },
          { id: "6", label: "Help", url: "/help", position: 6, published: true, navigation_side: "left" as const },
          {
            id: "7",
            label: "Support",
            url: "/support",
            position: 7,
            published: true,
            navigation_side: "left" as const,
          },
        ]

  const settings = navSettings || {
    logo_type: "image" as const,
    logo_text: "TektonStable",
    logo_image_url: "/tektons-table-logo.png",
  }

  return <MarketingNavClient menuItems={items} navSettings={settings} />
}
