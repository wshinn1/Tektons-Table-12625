"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { tenantSignOut } from "@/app/actions/tenant-auth"

function HouseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer roof */}
      <path
        d="M50 2L2 50h10L50 14l38 36h10L50 2z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Inner roof */}
      <path
        d="M50 18L18 50h8l24-24 24 24h8L50 18z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* House body with door */}
      <path d="M30 50v28h40V50L50 30 30 50z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      {/* Door */}
      <rect x="40" y="55" width="20" height="23" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* Chimney */}
      <rect x="65" y="25" width="8" height="15" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

interface TenantSidebarProps {
  subdomain: string
  tenantName: string
  user?: User | null
  isTenantOwner?: boolean
  autoHide?: boolean
  pageBuilderEnabled?: boolean
  campaigns?: Array<{
    id: string
    title: string
    slug: string
    current_amount: number
    goal_amount: number
    status: string
  }>
}

interface NavItem {
  label: string
  href: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

export function TenantSidebar({
  subdomain,
  tenantName,
  user,
  isTenantOwner,
  autoHide = false,
  pageBuilderEnabled = false,
  campaigns = [],
}: TenantSidebarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(autoHide)
  const [campaignsExpanded, setCampaignsExpanded] = useState(true)

  const activeCampaigns = campaigns.filter((c) => c.status === "active").slice(0, 5)

  const publicNavSections: NavSection[] = [
    {
      items: [
        { label: "Home", href: `/` },
        { label: "About", href: `/about` },
        { label: "Support", href: `/giving` },
        { label: "Subscribe", href: `/subscribe` },
        { label: "Contact", href: `/contact` },
      ],
    },
  ]

  const adminNavSections: NavSection[] = isTenantOwner
    ? [
        {
          title: "ADMIN",
          items: [
            { label: "New Post", href: `/admin/blog/create` },
            { label: "Manage Posts", href: `/admin/blog` },
            { label: "Edit About Page", href: `/admin/about` },
            { label: "Manage Giving", href: `/admin/giving` },
            { label: "Manage Campaigns", href: `/admin/campaigns` },
            { label: "Form Submissions", href: `/admin/contact-submissions` },
            { label: "Navigation Menu", href: `/admin/navigation` },
            { label: "Email Newsletter", href: `/admin/newsletter` },
            { label: "Supporters", href: `/admin/supporters` },
            { label: "Financial Reports", href: `/admin/financial` },
            { label: "Blog Analytics", href: `/admin/analytics` },
            { label: "User Management", href: `/admin/users` },
            { label: "Settings", href: `/admin/settings` },
            ...(pageBuilderEnabled
              ? [
                  { label: "Custom Pages", href: `/admin/pages` },
                  { label: "Menu Manager", href: `/admin/menu` },
                ]
              : []),
          ],
        },
      ]
    : []

  useEffect(() => {
    const saved = localStorage.getItem(`tenant-sidebar-collapsed-${subdomain}`)
    if (autoHide) {
      setIsCollapsed(true)
    } else if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
  }, [subdomain, autoHide])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(`tenant-sidebar-collapsed-${subdomain}`, String(newState))
  }

  const isActive = (href: string) => {
    if (href === `/`) {
      return pathname === `/` || pathname === `/${subdomain}` || pathname === `/home`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const allSections = [...publicNavSections, ...adminNavSections]

  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false)
    }
  }

  const getProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100)
  }

  return (
    <>
      <Button
        variant="outline"
        size="default"
        className="fixed top-4 left-4 z-[60] md:hidden bg-white shadow-lg border-2 hover:bg-gray-50 font-old-standard font-bold gap-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <>
            <X className="h-5 w-5" />
            <span>Close</span>
          </>
        ) : (
          <>
            <Menu className="h-5 w-5" />
            <span>Menu</span>
          </>
        )}
      </Button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[45] md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {isCollapsed && !mobileMenuOpen && (
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex fixed left-2 top-1/2 -translate-y-1/2 z-[50] w-12 h-12 items-center justify-center bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
          title="Open menu"
        >
          <HouseIcon className="w-8 h-8 text-gray-800 rotate-90" />
        </button>
      )}

      {/* Sidebar - only show when not collapsed or mobile menu is open */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-[50] h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 font-open-sans",
          isCollapsed ? "w-0 md:w-0 overflow-hidden" : "w-64",
          mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 pt-16 md:pt-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-open-sans font-bold text-black">{tenantName || subdomain}</h1>
            {user && (
              <p className="text-sm font-open-sans font-semibold text-gray-600 mt-1 truncate">
                {isTenantOwner ? "Owner" : "Follower"}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="hidden md:flex shrink-0 hover:bg-gray-100 gap-2 font-open-sans font-bold"
            title="Collapse sidebar"
          >
            <X className="h-4 w-4" />
            <span className="text-xs">Hide</span>
          </Button>
        </div>

        <div className="p-4 border-b border-gray-200">
          {user ? (
            <form action={tenantSignOut.bind(null, subdomain)}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-open-sans font-bold text-black rounded-lg transition-all duration-300 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-[#1e3a8a] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Sign Out</span>
              </button>
            </form>
          ) : (
            <Link
              href="https://tektonstable.com/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-open-sans font-bold text-black rounded-lg transition-all duration-300 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-[#1e3a8a] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Sign In</span>
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
          {allSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <div className="px-3 py-2 text-xs font-open-sans font-bold text-black uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigation}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-open-sans font-bold transition-all duration-300 relative overflow-hidden group",
                      isActive(item.href)
                        ? "bg-gray-100 text-black"
                        : "text-black hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    {!isActive(item.href) && (
                      <span className="absolute inset-0 bg-[#1e3a8a] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                    )}
                    <span
                      className={cn(
                        "relative z-10 transition-colors duration-300",
                        !isActive(item.href) && "group-hover:text-white",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {activeCampaigns.length > 0 && (
            <div>
              <button
                onClick={() => setCampaignsExpanded(!campaignsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-open-sans font-bold text-black uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span>Campaigns</span>
                {campaignsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {campaignsExpanded && (
                <div className="space-y-0.5 mt-1">
                  {activeCampaigns.map((campaign) => {
                    const progress = getProgress(campaign.current_amount, campaign.goal_amount)
                    const isCompleted = progress >= 100

                    return (
                      <Link
                        key={campaign.id}
                        href={`/campaigns/${campaign.slug}`}
                        onClick={handleNavigation}
                        className={cn(
                          "flex flex-col gap-1 px-3 py-2 rounded-lg text-sm font-open-sans transition-all duration-300 relative overflow-hidden group",
                          isActive(`/campaigns/${campaign.slug}`)
                            ? "bg-green-50 text-green-900 font-bold"
                            : "text-black font-semibold hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        {!isActive(`/campaigns/${campaign.slug}`) && (
                          <span className="absolute inset-0 bg-[#1e3a8a] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        )}
                        <div className="flex items-center gap-2 relative z-10">
                          <span
                            className={cn(
                              "font-bold text-xs line-clamp-1 transition-colors duration-300",
                              !isActive(`/campaigns/${campaign.slug}`) && "group-hover:text-white",
                            )}
                          >
                            {campaign.title}
                          </span>
                          {isCompleted && <span className="text-green-600">✓</span>}
                        </div>
                        <div className="relative z-10">
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                isCompleted ? "bg-green-600" : "bg-green-500",
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-open-sans font-bold mt-0.5 block transition-colors duration-300",
                              !isActive(`/campaigns/${campaign.slug}`)
                                ? "text-gray-900 group-hover:text-white"
                                : "text-gray-900",
                            )}
                          >
                            {progress}%
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
