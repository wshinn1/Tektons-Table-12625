"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
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

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Giving", href: "/admin/giving", icon: Heart },
  { label: "Blog Posts", href: "/admin/blog", icon: FileText },
  { label: "Campaigns", href: "/admin/campaigns", icon: FolderOpen },
  { label: "Supporters", href: "/admin/supporters", icon: Users },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Contact Forms", href: "/admin/contact-submissions", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Navigation", href: "/admin/navigation", icon: MenuIcon },
  { label: "About Page", href: "/admin/about", icon: UserCircle }, // Added About page link
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const pageBuilderItems = [{ label: "Custom Pages", href: "/admin/pages", icon: FolderOpen }]

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

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === `/${subdomain}/admin`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const allItems = [...adminNavItems.slice(0, 9), ...pageBuilderItems, ...adminNavItems.slice(9)]

  // Find current page label
  const currentPage = allItems.find((item) => isActive(item.href))?.label || "Admin"

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

  const handleMenuItemClick = () => {
    setShowMenu(false)
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
                onClick={handleMenuItemClick}
                className={cn(
                  "flex items-center justify-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors",
                  active ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          <Link
            href={`/`}
            className="flex items-center justify-center gap-4 px-4 py-4 rounded-xl text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ExternalLink className="h-6 w-6 shrink-0" />
            <span>View Site</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={cn(
              "w-full flex items-center justify-center gap-4 px-4 py-4 rounded-xl text-lg font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors",
              isSigningOut && "opacity-50 cursor-not-allowed",
            )}
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
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
