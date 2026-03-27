"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
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
  UserCircle,
  X,
  QrCode,
  HelpCircle,
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
  { label: "QR Code", href: `/${subdomain}/admin/qr-code`, icon: QrCode },
  { label: "Navigation", href: `/${subdomain}/admin/navigation`, icon: MenuIcon },
  { label: "About Page", href: `/${subdomain}/admin/about`, icon: UserCircle },
  { label: "Settings", href: `/${subdomain}/admin/settings`, icon: Settings },
  { label: "Need Help/Feature Request?", href: `/${subdomain}/admin/help`, icon: HelpCircle },
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)



  const adminNavItems = getAdminNavItems(subdomain)
  const pageBuilderItems = getPageBuilderItems(subdomain)

  // Check if a nav item is active based on the current pathname
  const isActive = useCallback((href: string) => {
    if (href === `/${subdomain}/admin`) {
      return pathname === `/${subdomain}/admin`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }, [pathname, subdomain])

  const allItems = pageBuilderEnabled 
    ? [...adminNavItems.slice(0, 9), ...pageBuilderItems, ...adminNavItems.slice(9)]
    : adminNavItems

  // Find current page label
  const currentPage = allItems.find((item) => isActive(item.href))?.label || "Admin"

  // Close menu when pathname changes (navigation completed)
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setMenuOpen(false)

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed top bar with hamburger menu */}
      <header 
        className="fixed top-0 left-0 right-0 bg-gray-900 text-white h-14 flex items-center px-4 z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
          className="text-white hover:bg-gray-800 -ml-2"
          aria-label="Open menu"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
        <span className="flex-1 text-center font-semibold truncate px-2">{currentPage}</span>
        {/* Spacer to balance the hamburger button */}
        <div className="w-10" />
      </header>

      {/* Slide-out menu overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-[100]"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu panel */}
          <nav 
            className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-gray-900 text-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {/* Header with close button */}
            <div className="border-b border-gray-800 p-4 flex items-start justify-between">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-xl truncate">{tenantName}</span>
                {user?.email && (
                  <span className="text-sm text-gray-400 truncate">{user.email}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800 shrink-0 -mr-2"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Nav items - scrollable */}
            <div className="flex-1 p-3 overflow-y-auto overscroll-contain">
              <div className="space-y-1">
                {allItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        // Close menu first, then navigate
                        setMenuOpen(false)
                        // Use window.location for reliable navigation on iOS
                        window.location.href = item.href
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors w-full select-none",
                        "cursor-pointer text-left",
                        active 
                          ? "bg-primary text-white" 
                          : "text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700",
                      )}
                      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800 p-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  window.location.href = `/${subdomain}`
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full active:bg-gray-700 select-none cursor-pointer text-left"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <ExternalLink className="h-5 w-5 shrink-0" />
                <span className="flex-1">View Site</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors active:bg-red-800/50 cursor-pointer select-none text-left",
                  isSigningOut && "opacity-50 cursor-not-allowed",
                )}
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="flex-1">{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Page content */}
      <main className="pt-14">{children}</main>
    </div>
  )
}
