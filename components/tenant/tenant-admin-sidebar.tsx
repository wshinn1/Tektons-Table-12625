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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserCircle,
  HelpCircle,
  QrCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import type { User } from "@supabase/supabase-js"
import { tenantSignOut } from "@/app/actions/tenant-auth"

interface TenantAdminSidebarProps {
  subdomain: string
  tenantName: string
  user: User | null
  pageBuilderEnabled?: boolean
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
  { label: "QR Code", href: `/${subdomain}/admin/qr-code`, icon: QrCode },
  { label: "Navigation", href: `/${subdomain}/admin/navigation`, icon: MenuIcon },
  { label: "About Page", href: `/${subdomain}/admin/about`, icon: UserCircle },
  { label: "Settings", href: `/${subdomain}/admin/settings`, icon: Settings },
  { label: "Need Help?", href: `/${subdomain}/admin/help`, icon: HelpCircle },
]

const getPageBuilderItems = (subdomain: string) => [
  { label: "Custom Pages", href: `/${subdomain}/admin/pages`, icon: FolderOpen },
]

export function TenantAdminSidebar({
  subdomain,
  tenantName,
  user,
  pageBuilderEnabled = false,
}: TenantAdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const saved = localStorage.getItem(`tenant-admin-sidebar-collapsed-${subdomain}`)
      if (saved !== null) {
        setIsCollapsed(saved === "true")
      }
    }
  }, [subdomain, mounted])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(`tenant-admin-sidebar-collapsed-${subdomain}`, String(newState))
  }

  const adminNavItems = getAdminNavItems(subdomain)
  const pageBuilderItems = getPageBuilderItems(subdomain)

  const isActive = (href: string) => {
    if (href === `/${subdomain}/admin`) {
      return pathname === `/${subdomain}/admin`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const allItems = [...adminNavItems.slice(0, 9), ...pageBuilderItems, ...adminNavItems.slice(9)]

  const handleNavClick = useCallback(
    (isMobile: boolean) => {
      // For mobile, close the sheet - navigation happens naturally via Link
      if (isMobile) {
        setMobileOpen(false)
      }
    },
    [],
  )

  const handleSignOut = async (formData: FormData) => {
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

  const NavContent = ({ isMobile }: { isMobile: boolean }) => (
    <>
      {/* Header */}
      <div className={cn("border-b border-gray-800 p-4", !isMobile && isCollapsed && "px-2")}>
        <div className="flex items-center justify-between">
          {(isMobile || !isCollapsed) && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg truncate">{tenantName}</span>
              {user?.email && <span className="text-xs text-gray-400 truncate">{user.email}</span>}
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="text-gray-400 hover:text-white hover:bg-gray-800 shrink-0"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {allItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(isMobile)}
              title={!isMobile && isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation select-none",
                active ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700",
                !isMobile && isCollapsed && "justify-center",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(isMobile || !isCollapsed) && <span>{item.label}</span>}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-gray-800 p-2 space-y-1", !isMobile && isCollapsed && "px-1")}>
        <a
          href={`/${subdomain}`}
          onClick={() => handleNavClick(isMobile)}
          title={!isMobile && isCollapsed ? "View Site" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors touch-manipulation active:bg-gray-700 select-none",
            !isMobile && isCollapsed && "justify-center",
          )}
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          {(isMobile || !isCollapsed) && <span>View Site</span>}
        </a>
        <form action={handleSignOut}>
          <button
            type="submit"
            disabled={isSigningOut}
            title={!isMobile && isCollapsed ? "Sign Out" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors",
              !isMobile && isCollapsed && "justify-center",
              isSigningOut && "opacity-50 cursor-not-allowed",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(isMobile || !isCollapsed) && <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>}
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar - Always visible on md+ screens */}
      {/* Note: Mobile menu is handled by TenantAdminMobileMenu component in the layout */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-gray-900 text-white flex-col transition-all duration-300 z-40",
          "hidden md:flex",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <NavContent isMobile={false} />
      </aside>
    </>
  )
}
