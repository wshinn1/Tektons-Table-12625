"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

interface NavItem {
  id: string
  label: string
  url: string
  open_in_new_tab?: boolean
}

interface Campaign {
  id: string
  title: string
  slug: string
  current_amount: number
  goal_amount: number
  status: string
}

interface TenantNavbarProps {
  subdomain: string
  tenantName: string
  user?: User | null
  isTenantOwner?: boolean
  isDonor?: boolean
  navItems: NavItem[]
  campaigns?: Campaign[]
  visible?: boolean
  isCheckingAuth?: boolean
}

export function TenantNavbar({
  subdomain,
  tenantName,
  user,
  isTenantOwner,
  isDonor,
  navItems,
  campaigns = [],
  visible = true,
  isCheckingAuth = false,
}: TenantNavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [campaignsOpen, setCampaignsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const activeCampaigns = campaigns.filter((c) => c.status === "active").slice(0, 5)

  // Track scroll for subtle shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setCampaignsOpen(false)
  }, [pathname])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isActive = (href: string) => {
    if (href === "/" || href === "") {
      return pathname === "/" || pathname === `/${subdomain}` || pathname === "/home"
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const getProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100)
  }

  if (!visible) {
    return null
  }

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={cn(
          "w-full bg-white border-b border-gray-200 transition-shadow duration-200",
          isScrolled && "shadow-sm",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Tenant Name */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 font-open-sans">{tenantName || subdomain}</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.open_in_new_tab ? "_blank" : undefined}
                  rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 font-open-sans",
                    isActive(item.url)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Campaigns Dropdown */}
              {activeCampaigns.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setCampaignsOpen(!campaignsOpen)}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 font-open-sans",
                      campaignsOpen || pathname.includes("/campaigns")
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    Campaigns
                    <ChevronDown className={cn("h-4 w-4 transition-transform", campaignsOpen && "rotate-180")} />
                  </button>

                  {campaignsOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setCampaignsOpen(false)} />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
                        {activeCampaigns.map((campaign) => {
                          const progress = getProgress(campaign.current_amount, campaign.goal_amount)
                          return (
                            <Link
                              key={campaign.id}
                              href={`/campaigns/${campaign.slug}`}
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={() => setCampaignsOpen(false)}
                            >
                              <div className="font-semibold text-sm text-gray-900 mb-1">{campaign.title}</div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{progress}% funded</div>
                            </Link>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Auth Links */}
              {user ? (
                <Link
                  href={isTenantOwner ? "/admin" : isDonor ? "/donor" : "/admin"}
                  className="ml-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a8a]/90 transition-colors font-open-sans"
                >
                  {isTenantOwner ? "Dashboard" : isDonor ? "My Account" : "Dashboard"}
                </Link>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link
                    href="/auth/donor-login"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors font-open-sans"
                  >
                    Donor Login
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors font-open-sans"
                  >
                    Admin Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.open_in_new_tab ? "_blank" : undefined}
                  rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-semibold transition-colors font-open-sans",
                    isActive(item.url) ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Campaigns */}
              {activeCampaigns.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Campaigns</div>
                  {activeCampaigns.map((campaign) => {
                    const progress = getProgress(campaign.current_amount, campaign.goal_amount)
                    return (
                      <Link
                        key={campaign.id}
                        href={`/campaigns/${campaign.slug}`}
                        className="block px-4 py-3 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="font-semibold text-sm text-gray-900 mb-1">{campaign.title}</div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{progress}% funded</div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Mobile Auth */}
              <div className="pt-2 border-t border-gray-100 mt-2">
                {user ? (
                  <Link
                    href={isTenantOwner ? "/admin" : isDonor ? "/donor" : "/admin"}
                    className="block px-4 py-3 bg-[#1e3a8a] text-white rounded-lg text-sm font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {isTenantOwner ? "Dashboard" : isDonor ? "My Account" : "Dashboard"}
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/donor-login"
                      className="block px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Donor Login
                    </Link>
                    <Link
                      href="/auth/login"
                      className="block px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
