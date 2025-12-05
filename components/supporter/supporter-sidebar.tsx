"use client"

import { Home, Heart, CreditCard, Settings, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { flushSync } from "react-dom"

export function SupporterSidebar() {
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const links = [
    { href: "/supporter/dashboard", label: "Dashboard", icon: Home },
    { href: "/supporter/giving", label: "My Giving", icon: Heart },
    { href: "/supporter/payments", label: "Payment Methods", icon: CreditCard },
    { href: "/supporter/missionaries", label: "Missionaries", icon: User },
    { href: "/supporter/settings", label: "Settings", icon: Settings },
  ]

  const handleSignOut = async () => {
    console.log("[v0] Supporter sign out initiated")

    // Immediately update state synchronously to hide authenticated UI
    flushSync(() => {
      setIsSigningOut(true)
    })

    const { createBrowserClient } = await import("@/lib/supabase/client")
    const supabase = createBrowserClient()
    await supabase.auth.signOut()

    console.log("[v0] Supporter signed out - reloading page")

    // Give DOM time to update before reloading
    setTimeout(() => {
      window.location.reload()
    }, 150)
  }

  if (isSigningOut) {
    return (
      <div className="flex h-screen w-64 flex-col border-r bg-background items-center justify-center">
        <p className="text-sm text-muted-foreground">Signing out...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold">Supporter Portal</h2>
        <p className="text-sm text-muted-foreground">Manage your giving</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
