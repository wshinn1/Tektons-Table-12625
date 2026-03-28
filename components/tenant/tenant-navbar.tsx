"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { Menu, X, ChevronDown, UserCircle } from "lucide-react"
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
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [campaignsOpen, setCampaignsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

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
    setAccountOpen(false)
    setIsNavigating(false)
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

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, url: string, external?: boolean) => {
      if (external) return // Let external links work normally

      if (isNavigating) {
        e.preventDefault()
        return
      }

      e.preventDefault()

      setIsNavigating(true)

      window.location.href = url
    },
    [isNavigating],
  )

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
            <a href="/" className="flex-shrink-0" onClick={(e) => handleNavClick(e, "/")}>
              <h1 className="text-xl font-bold text-gray-900 font-open-sans">{tenantName || subdomain}</h1>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  onClick={(e) => handleNavClick(e, item.url, item.open_in_new_tab)}
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
                </a>
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
                            <a
                              key={campaign.id}
                              href={`/${subdomain}/campaigns/${campaign.slug}`}
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={(e) => {
                                setCampaignsOpen(false)
                                handleNavClick(e, `/${subdomain}/campaigns/${campaign.slug}`)
                              }}
                            >
                              <div className="font-semibold text-sm text-gray-900 mb-1">{campaign.title}</div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{progress}% funded</div>
                            </a>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Auth Links */}
              {user ? (
                <a
                  href={isTenantOwner ? `/${subdomain}/admin` : isDonor ? `/${subdomain}/donor` : `/${subdomain}/admin`}
                  onClick={(e) => handleNavClick(e, isTenantOwner ? `/${subdomain}/admin` : isDonor ? `/${subdomain}/donor` : `/${subdomain}/admin`)}
                  className="ml-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a8a]/90 transition-colors font-open-sans"
                >
                  {isTenantOwner ? "Dashboard" : isDonor ? "My Account" : "Dashboard"}
                </a>
              ) : (
                <div className="relative ml-2">
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 font-open-sans border border-gray-300",
                      accountOpen
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                    style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                  >
                    <UserCircle className="h-4 w-4" />
                    Account
                    <ChevronDown className={cn("h-4 w-4 transition-transform", accountOpen && "rotate-180")} />
                  </button>

                  {accountOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setAccountOpen(false)}
                        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
                        <a
                          href={`/${subdomain}/auth/donor-login`}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            setAccountOpen(false)
                            handleNavClick(e, `/${subdomain}/auth/donor-login`)
                          }}
                          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                        >
                          <div className="font-semibold text-sm text-gray-900">Supporter Account</div>
                          <div className="text-xs text-gray-500 mt-0.5">Manage giving & subscriptions</div>
                        </a>
                        <div className="border-t border-gray-100 my-1" />
                        <a
                          href={`/${subdomain}/auth/login`}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            setAccountOpen(false)
                            handleNavClick(e, `/${subdomain}/auth/login`)
                          }}
                          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                        >
                          <div className="font-semibold text-sm text-gray-900">Admin Login</div>
                          <div className="text-xs text-gray-500 mt-0.5">Site owner access</div>
                        </a>
                      </div>
                    </>
                  )}
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
                <a
                  key={item.id}
                  href={item.url}
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    handleNavClick(e, item.url, item.open_in_new_tab)
                  }}
                  target={item.open_in_new_tab ? "_blank" : undefined}
                  rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-semibold transition-colors font-open-sans",
                    isActive(item.url) ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile Campaigns */}
              {activeCampaigns.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Campaigns</div>
                  {activeCampaigns.map((campaign) => {
                    const progress = getProgress(campaign.current_amount, campaign.goal_amount)
                    return (
                      <a
                        key={campaign.id}
                        href={`/${subdomain}/campaigns/${campaign.slug}`}
                        className="block px-4 py-3 hover:bg-gray-50"
                        onClick={(e) => {
                          setMobileMenuOpen(false)
                          handleNavClick(e, `/${subdomain}/campaigns/${campaign.slug}`)
                        }}
                      >
                        <div className="font-semibold text-sm text-gray-900 mb-1">{campaign.title}</div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{progress}% funded</div>
                      </a>
                    )
                  })}
                </div>
              )}

              {/* Mobile Auth */}
              <div className="pt-2 border-t border-gray-100 mt-2">
                {user ? (
                  <a
                    href={isTenantOwner ? `/${subdomain}/admin` : isDonor ? `/${subdomain}/donor` : `/${subdomain}/admin`}
                    className="block px-4 py-3 bg-[#1e3a8a] text-white rounded-lg text-sm font-semibold text-center"
                    onClick={(e) => {
                      setMobileMenuOpen(false)
                      handleNavClick(e, isTenantOwner ? `/${subdomain}/admin` : isDonor ? `/${subdomain}/donor` : `/${subdomain}/admin`)
                    }}
                    style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                  >
                    {isTenantOwner ? "Dashboard" : isDonor ? "My Account" : "Dashboard"}
                  </a>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Account</div>
                    <a
                      href={`/${subdomain}/auth/donor-login`}
                      className="block px-4 py-3 hover:bg-gray-50 rounded-lg"
                      onClick={(e) => {
                        setMobileMenuOpen(false)
                        handleNavClick(e, `/${subdomain}/auth/donor-login`)
                      }}
                      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                    >
                      <div className="font-semibold text-sm text-gray-900">Supporter Account</div>
                      <div className="text-xs text-gray-500 mt-0.5">Manage giving & subscriptions</div>
                    </a>
                    <a
                      href={`/${subdomain}/auth/login`}
                      className="block px-4 py-3 hover:bg-gray-50 rounded-lg"
                      onClick={(e) => {
                        setMobileMenuOpen(false)
                        handleNavClick(e, `/${subdomain}/auth/login`)
                      }}
                      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                    >
                      <div className="font-semibold text-sm text-gray-900">Admin Login</div>
                      <div className="text-xs text-gray-500 mt-0.5">Site owner access</div>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
