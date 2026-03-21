"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
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

// Navigation items - uses subdomain prefix for internal routing
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

export function TenantAdminMobileMenu({
  subdomain,
  tenantName,
  user,
  pageBuilderEnabled = false,
  children,
}: TenantAdminMobileMenuProps) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const adminNavItems = getAdminNavItems(subdomain)
  const pageBuilderItems = getPageBuilderItems(subdomain)

  // Check if a nav item is active based on the current pathname
  const isActive = (href: string) => {
    if (href === `/${subdomain}/admin`) {
      return pathname === `/${subdomain}/admin`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const allItems = [...adminNavItems.slice(0, 9), ...pageBuilderItems, ...adminNavItems.slice(9)]

  // Find current page label
  const currentPage = allItems.find((item) => isActive(item.href))?.label || "Admin"

  const handleNavClick = () => {
    // Hide the menu and show the page content
    setShowMenu(false)
  }

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
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors w-full touch-manipulation select-none",
                  active ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700",
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          <Link
            href={`/${subdomain}`}
            onClick={handleNavClick}
            className="flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full touch-manipulation active:bg-gray-700 select-none"
          >
            <ExternalLink className="h-6 w-6 shrink-0" />
            <span className="flex-1">View Site</span>
          </Link>
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
          onClick={() => setShowMenu(true)}
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
