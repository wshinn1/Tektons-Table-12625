"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
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
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const pageBuilderItems = [{ label: "Custom Pages", href: "/admin/pages", icon: FolderOpen }]

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

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === `/${subdomain}/admin`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const allItems = [...adminNavItems, ...(pageBuilderEnabled ? pageBuilderItems : [])]

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
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              title={!isMobile && isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                !isMobile && isCollapsed && "justify-center",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(isMobile || !isCollapsed) && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-gray-800 p-2 space-y-1", !isMobile && isCollapsed && "px-1")}>
        <Link
          href={`/`}
          onClick={() => isMobile && setMobileOpen(false)}
          title={!isMobile && isCollapsed ? "View Site" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors",
            !isMobile && isCollapsed && "justify-center",
          )}
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          {(isMobile || !isCollapsed) && <span>View Site</span>}
        </Link>
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
      <div
        className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 px-4 h-14 flex items-center justify-between md:hidden"
        style={{ zIndex: 9999 }}
      >
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 -ml-2">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-gray-900 border-gray-800" style={{ zIndex: 10000 }}>
            <SheetTitle className="sr-only">Admin Menu</SheetTitle>
            <div className="flex flex-col h-full text-white">
              <NavContent isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-white font-semibold truncate flex-1 text-center">{tenantName} Admin</span>
        <div className="w-10" />
      </div>

      {/* Desktop Sidebar - Always visible on md+ screens */}
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
