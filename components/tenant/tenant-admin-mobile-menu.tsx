"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  LayoutDashboard,
  Heart,
  FileText,
  FolderOpen,
  MenuIcon,
  Settings,
  Users,
  BarChart3,
  Mail,
  MessageSquare,
  LogOut,
  ExternalLink,
  ArrowLeft,
  UserCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { tenantSignOut } from "@/app/actions/tenant-auth"

interface TenantAdminMobileMenuProps {
  subdomain: string
  tenantName: string
  user: User | null
  pageBuilderEnabled?: boolean
  children: React.ReactNode
}

// Navigation items with paths relative to tenant root - subdomain will be prepended
const getAdminNavItems = (subdomain: string) => [
  { label: "Dashboard", href: `/${subdomain}/admin`, icon: LayoutDashboard },
  { label: "Manage Giving", href: `/${subdomain}/admin/giving`, icon: Heart },
  { label: "Blog Posts", href: `/${subdomain}/admin/blog`, icon: FileText },
  { label: "Campaigns", href: `/${subdomain}/admin/campaigns`, icon: FolderOpen },
  { label: "Supporters", href: `/${subdomain}/admin/supporters`, icon: Users },
  { label: "Newsletter", href: `/${subdomain}/admin/newsletter`, icon: Mail },
  { label: "Contact Forms", href: `/${subdomain}/admin/contact-submissions`, icon: MessageSquare },
  { label: "Analytics", href: `/${subdomain}/admin/analytics`, icon: BarChart3 },
  { label: "Navigation", href: `/${subdomain}/admin/navigation`, icon: MenuIcon },
  { label: "About Page", href: `/${subdomain}/admin/about`, icon: UserCircle },
  { label: "Settings", href: `/${subdomain}/admin/settings`, icon: Settings },
]

const getPageBuilderItems = (subdomain: string) => [
  { label: "Custom Pages", href: `/${subdomain}/admin/pages`, icon: FolderOpen },
]

// Storage key for menu state
const getMenuStateKey = (subdomain: string) => `tenant-mobile-menu-state-${subdomain}`

export function TenantAdminMobileMenu({
  subdomain,
  tenantName,
  user,
  pageBuilderEnabled = false,
  children,
}: TenantAdminMobileMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Start with null to indicate "not yet determined" state
  const [showMenu, setShowMenu] = useState<boolean | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const previousPathnameRef = useRef(pathname)
  const hasInitializedRef = useRef(false)
  
  // Initialize from sessionStorage on mount (client-side only)
  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true
    
    try {
      const stored = sessionStorage.getItem(getMenuStateKey(subdomain))
      if (stored) {
        const { showMenu: savedShowMenu, timestamp } = JSON.parse(stored)
        // Only use saved state if it's less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          console.log("[v0] Mobile menu: Restored showMenu state from sessionStorage:", savedShowMenu)
          setShowMenu(savedShowMenu)
          return
        }
      }
    } catch (e) {
      // Ignore errors
    }
    // Default to showing menu
    setShowMenu(true)
  }, [subdomain])
  
  // Persist menu state to sessionStorage
  const persistMenuState = useCallback((show: boolean) => {
    try {
      sessionStorage.setItem(
        getMenuStateKey(subdomain),
        JSON.stringify({ showMenu: show, timestamp: Date.now() })
      )
    } catch (e) {
      // Ignore errors
    }
  }, [subdomain])

  const adminNavItems = getAdminNavItems(subdomain)
  const pageBuilderItems = getPageBuilderItems(subdomain)
  
  const isActive = (href: string) => {
    if (href === `/${subdomain}/admin`) {
      return pathname === `/${subdomain}/admin`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const allItems = [...adminNavItems.slice(0, 9), ...pageBuilderItems, ...adminNavItems.slice(9)]

  // Find current page label
  const currentPage = allItems.find((item) => isActive(item.href))?.label || "Admin"

  // When pathname changes and we were navigating, clear the navigating state
  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      console.log("[v0] Mobile menu: Pathname changed to", pathname)
      setIsNavigating(false)
      previousPathnameRef.current = pathname
    }
  }, [pathname])
  
  // Custom setShowMenu that also persists to sessionStorage
  const updateShowMenu = useCallback((show: boolean) => {
    setShowMenu(show)
    persistMenuState(show)
  }, [persistMenuState])
  
  // Handle navigation to a menu item using direct window.location for reliable navigation
  const handleNavigation = useCallback((href: string) => {
    console.log("[v0] Mobile menu: Navigating to", href)
    setIsNavigating(true)
    // Persist state BEFORE navigating
    persistMenuState(false)
    // Use window.location for reliable full navigation
    window.location.href = href
  }, [persistMenuState])

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(`tenant-owner-${subdomain}`)
        localStorage.removeItem(`tenant-admin-sidebar-collapsed-${subdomain}`)
      }
    } catch (e) {
      console.error("Error clearing localStorage:", e)
    }

    await new Promise((resolve) => setTimeout(resolve, 50))

    const formData = new FormData()
    return tenantSignOut(subdomain)
  }

  // Show full-screen menu
  if (showMenu) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex flex-col">
            <span className="font-bold text-xl">{tenantName}</span>
            {user?.email && <span className="text-sm text-gray-400">{user.email}</span>}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {allItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <button
                key={item.href}
                type="button"
                disabled={isNavigating}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors w-full touch-manipulation select-none text-left",
                  active ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700",
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          <button
            type="button"
            disabled={isNavigating}
            onClick={() => handleNavigation(`/${subdomain}`)}
            className="flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full touch-manipulation active:bg-gray-700 select-none text-left"
          >
            <ExternalLink className="h-6 w-6 shrink-0" />
            <span className="flex-1">View Site</span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors touch-manipulation active:bg-red-800/50",
              isSigningOut && "opacity-50 cursor-not-allowed",
            )}
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span className="flex-1">{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    )
  }

  // Show page content with back button
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar with back to menu button */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white h-14 flex items-center px-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateShowMenu(true)}
          className="text-white hover:bg-gray-800 -ml-2 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Menu</span>
        </Button>
        <span className="flex-1 text-center font-semibold truncate pr-16">{currentPage}</span>
      </div>

      {/* Page content */}
      <main className="pt-14">{children}</main>
    </div>
  )
}
