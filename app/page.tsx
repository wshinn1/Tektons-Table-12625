import { MarketingNavClient } from "@/components/marketing-nav-client"
import { HomepageSectionRenderer } from "@/components/homepage-section-renderer"
import { MarketingFooter } from "@/components/marketing-footer"

const STATIC_SECTIONS = [
  {
    id: "hero-1",
    section_type: "hero",
    display_order: 0,
    is_active: true,
    content: {
      headline: "Everything needed to raise Long-Term support",
      subtitle:
        "Stop paying $200+/month for multiple tools. Get fundraising pages, email newsletters, CRM, and more — all in one platform for zero monthly fees.",
      buttonLink: "https://tektonstable.com/how-it-works",
      buttonText: "Get started — it's free",
      buttonColor: "#FDB913",
      overlayColor: "#828282",
      backgroundUrl: "https://ram90tjooucmwuhd.public.blob.vercel-storage.com/Video%20BGs/Video%201.mp4",
      enableTopBlur: true,
      backgroundType: "cdn",
      overlayOpacity: 22,
      backgroundColor: "#474747",
      enableBottomBlur: true,
    },
  },
  {
    id: "hero-2",
    section_type: "hero_section",
    display_order: 1,
    is_active: true,
    content: {
      heading: "Visual Story Telling",
      heading2: "Short & Long Term Fundraising",
      textColor: "#ffffff",
      subheadingItalic: "&",
      showDecorativeLines: true,
      decorativeLineColor: "#ffffff",
      decorativeLineWidth: 60,
      borderOpacity: 80,
      overlayColor: "#000000",
      overlayOpacity: 40,
      backgroundType: "cdn",
      backgroundUrl: "https://ram90tjooucmwuhd.public.blob.vercel-storage.com/Video%20BGs/Video%203.mp4",
    },
  },
  {
    id: "about-1",
    title: "Visual Tekton About 1",
    section_type: "About",
    display_order: 2,
    is_active: true,
    content: {
      label: "TEKTŌN'S TABLE",
      headline: "Your Story. Their Heart. God's Work.",
      body1:
        "Here's the reality: Tekton's Table exists because too many incredible missionaries are struggling with two massive problems that honestly shouldn't be problems at all—how to show people what God is actually doing through their work, and how to receive support without it feeling awkward or unprofessional.",
      body2:
        "Let's talk about the visual piece first. There's that moment when a missionary is serving on the field and something absolutely miraculous happens. Maybe it's the moment a child finally smiles after weeks of trauma. Maybe it's watching a community come together for the first time to worship. Maybe it's seeing a family restored, a life transformed, hope breaking through in the darkest places. Standing there in that moment, the thought hits: \"If people could just SEE this—if they could witness what's happening right now—they'd understand. They'd feel it. They'd know their support matters.\"",
      body3:
        'Tekton\'s Table changes that entire experience. Right there, in the same place where someone just watched God move through a ministry—right when their heart is saying "I want to be part of this"—they can set up monthly recurring support or make a one-time gift. Professional. Secure. Dignified.',
      media1_url: "https://ram90tjooucmwuhd.public.blob.vercel-storage.com/Video%20BGs/Video%205.mp4",
      media1_type: "cdn",
      media2_url: "https://ram90tjooucmwuhd.public.blob.vercel-storage.com/Video%20BGs/DSCF7601-Edit_websize.jpg",
      media2_type: "image",
      button_text: "Learn More",
      button_url: "/about",
    },
  },
  {
    id: "features-1",
    title: "Your complete fundraising toolkit",
    subtitle: "Everything you need to build relationships, share your story, and manage support—all in one place.",
    section_type: "features_grid",
    display_order: 3,
    is_active: true,
    content: {
      features: [
        {
          icon: "Users",
          badge: "Core Feature",
          title: "CRM & Contacts",
          badgeColor: "#ef4444",
          description: "Track every conversation, prayer request, and relationship in one central hub.",
        },
        {
          icon: "Mail",
          badge: "No Limits",
          title: "Email Newsletters",
          badgeColor: "#22c55e",
          description: "Send beautiful, personalized updates to your supporters without any monthly fees.",
        },
        {
          icon: "Globe",
          badge: "Included",
          title: "Personal Fundraising Site",
          badgeColor: "#3b82f6",
          description: "Get your own custom website to share your story and accept donations.",
        },
        {
          icon: "DollarSign",
          badge: "Industry Standard",
          title: "Donation Processing",
          badgeColor: "#8b5cf6",
          description: "Accept one-time and recurring donations with low 2.9% + $0.30 processing fees.",
        },
        {
          icon: "BarChart3",
          badge: "Data-Driven",
          title: "Analytics & Reports",
          badgeColor: "#f59e0b",
          description: "Track your progress with detailed insights on donations, engagement, and growth.",
        },
        {
          icon: "Shield",
          badge: "Enterprise-Grade",
          title: "Security & Compliance",
          badgeColor: "#06b6d4",
          description: "Bank-level encryption and PCI compliance keep your donors' information safe.",
        },
      ],
    },
  },
  {
    id: "pricing-1",
    title: "Save $1,620 - $3,072 per year",
    subtitle: "See how Tekton's Table compares to paying for multiple tools separately.",
    section_type: "pricing_comparison",
    display_order: 4,
    is_active: true,
    content: {
      leftCard: {
        title: "Traditional Approach",
        subtitle: "Multiple subscriptions add up fast",
        backgroundColor: "#FEF2F2",
        borderColor: "#FCA5A5",
        titleColor: "#DC2626",
        items: [
          { label: "CRM/Contact Management", value: "$29/mo" },
          { label: "Email Marketing Platform", value: "$50/mo" },
          { label: "Website Builder", value: "$16/mo" },
          { label: "Donation Platform Fees", value: "$40/mo" },
        ],
        monthlyTotal: "$135/mo",
        annualTotal: "$1,620/year",
      },
      rightCard: {
        title: "Tekton's Table",
        subtitle: "Everything included, zero subscription",
        backgroundColor: "#F0FDF4",
        borderColor: "#86EFAC",
        badge: "BEST VALUE",
        badgeColor: "#16A34A",
        items: [
          { label: "CRM/Contact Management", isCheck: true },
          { label: "Email Marketing Platform", isCheck: true },
          { label: "Website Builder", isCheck: true },
          { label: "Donation Processing", value: "2.9% + $0.30" },
        ],
        monthlyTotal: "$0/mo",
        annualTotal: "$0/year",
        savings: "$1,620+/year",
      },
    },
  },
  {
    id: "benefits-1",
    title: "Built specifically for missionaries",
    subtitle:
      "We understand the unique challenges of support raising. Our platform is designed with your ministry in mind.",
    section_type: "benefits_columns",
    display_order: 5,
    is_active: true,
    content: {
      benefits: [
        {
          icon: "Zap",
          title: "Quick Setup",
          iconColor: "#ef4444",
          description: "Get your fundraising site live in under 5 minutes. No technical skills required.",
          iconBgColor: "#fee2e2",
        },
        {
          icon: "Heart",
          title: "Donor-Friendly",
          iconColor: "#3b82f6",
          description: "Beautiful, mobile-optimized giving experience that makes it easy for supporters to give.",
          iconBgColor: "#dbeafe",
        },
        {
          icon: "TrendingUp",
          title: "Track Progress",
          iconColor: "#16a34a",
          description: "Visual progress bars and goal tracking keep you and your supporters motivated.",
          iconBgColor: "#dcfce7",
        },
      ],
    },
  },
  {
    id: "cta-1",
    title: "Ready to save thousands and raise more support?",
    subtitle: "Join missionaries worldwide who are using Tekton's Table to fund their ministries.",
    section_type: "cta_section",
    display_order: 6,
    is_active: true,
    button_text: "Get Started Free",
    button_url: "https://tektonstable.com/how-it-works",
    button_color: "#F39C7F",
    content: {
      ctaLink: "https://tektonstable.com/how-it-works",
      ctaText: "Get Started Free",
      headline: "Ready to save thousands and raise more support?",
      disclaimer: "No credit card required • Setup in 5 minutes • Cancel anytime",
      subheadline: "Join thousands of missionaries who have simplified their fundraising",
      backgroundType: "gradient",
      backgroundColorHex: "#F39C7F",
    },
  },
]

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
  logo_type: "image",
  logo_text: "TektonStable",
  logo_image_url: "/tektons-table-logo.png",
}

export const dynamic = "force-static"
export const revalidate = 3600 // Revalidate every hour

export default async function LandingPage() {
  const sections = STATIC_SECTIONS
  const navItems = STATIC_NAV_ITEMS
  const navSettings = STATIC_NAV_SETTINGS

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavClient menuItems={navItems} navSettings={navSettings} />
      <HomepageSectionRenderer sections={sections} />
      <MarketingFooter />
    </div>
  )
}
