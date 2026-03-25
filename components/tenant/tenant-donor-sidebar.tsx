"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, History, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

interface TenantDonorSidebarProps {
  tenantName: string
  tenantSlug: string
  donorName?: string
  donorEmail?: string
}

export function TenantDonorSidebar({ tenantName, tenantSlug, donorName, donorEmail }: TenantDonorSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const menuItems = [
    {
      label: "Dashboard",
      href: `/${tenantSlug}/donor`,
      icon: LayoutDashboard,
    },
    {
      label: "Giving History",
      href: `/${tenantSlug}/donor/giving`,
      icon: History,
    },
    {
      label: "Manage Recurring",
      href: `/${tenantSlug}/donor/recurring`,
      icon: CreditCard,
    },
    {
      label: "Settings",
      href: `/${tenantSlug}/donor/settings`,
      icon: Settings,
    },
  ]

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 50))
        const cacheKey = `donor_cache_${tenantSlug}`
        localStorage.removeItem(cacheKey)
        console.log("[v0] Cleared donor cache before signout")
      } catch (error) {
        console.error("[v0] Failed to clear donor cache:", error)
      }
    }

    try {
      const { donorSignOut } = await import("@/app/actions/supporter-auth")
      await donorSignOut()
    } catch (error) {
      console.error("[v0] Signout error:", error)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      await supabase.auth.signOut({ scope: "global" })
      router.push("/")
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        {!collapsed && (
          <div className="truncate">
            <p className="text-sm font-semibold truncate">{tenantName}</p>
            <p className="text-xs text-slate-400">Donor Portal</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && (donorName || donorEmail) && (
        <div className="border-b border-slate-700 px-4 py-3">
          <p className="text-sm font-medium truncate">{donorName || "Donor"}</p>
          <p className="text-xs text-slate-400 truncate">{donorEmail}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-slate-300 hover:bg-slate-800 hover:text-white",
                collapsed && "justify-center",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-2">
        <Link
          href={`/${tenantSlug}`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Back to Site" : undefined}
        >
          <ChevronLeft className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
            collapsed && "justify-center",
            isSigningOut && "opacity-50 cursor-not-allowed",
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>}
        </button>
      </div>
    </aside>
  )
}
