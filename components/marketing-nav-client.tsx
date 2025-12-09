"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ExternalLink, User, Crown, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MenuItem {
  id: string
  label: string
  url: string
  position: number
  published: boolean
  navigation_side: "left" | "right"
}

interface NavSettings {
  logo_type: "image" | "text"
  logo_text: string
  logo_image_url: string
}

interface MarketingNavClientProps {
  menuItems: MenuItem[]
  navSettings: NavSettings
}

export function MarketingNavClient({ menuItems, navSettings }: MarketingNavClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const leftItems = menuItems.filter((item) => item.navigation_side === "left")
  const rightItems = menuItems.filter((item) => item.navigation_side === "right")

  const isExternalUrl = (url: string) => url.startsWith("http://") || url.startsWith("https://")

  const renderNavLink = (item: MenuItem, className: string, onClick?: () => void) => {
    if (isExternalUrl(item.url)) {
      return (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={onClick}
        >
          {item.label}
          <ExternalLink className="inline-block ml-1 h-3 w-3 opacity-50" />
        </a>
      )
    }
    return (
      <Link key={item.id} href={item.url} className={className} onClick={onClick}>
        {item.label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {navSettings.logo_type === "image" ? (
              <Image
                src={navSettings.logo_image_url || "/tektons-table-logo.png"}
                alt={navSettings.logo_text || "Logo"}
                width={180}
                height={60}
                className="h-10 w-auto"
                priority
              />
            ) : (
              <span className="text-xl font-bold">{navSettings.logo_text}</span>
            )}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {/* Left navigation items */}
          {leftItems.map((item) => renderNavLink(item, "text-sm font-medium hover:text-primary transition-colors"))}

          {/* Right navigation items */}
          {rightItems.map((item) => renderNavLink(item, "text-sm font-medium hover:text-primary transition-colors"))}

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{user.email?.split("@")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account/subscription" className="flex items-center gap-2 cursor-pointer">
                        <Crown className="h-4 w-4" />
                        My Subscription
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
                    Log In
                  </Link>
                  <Button asChild>
                    <Link href="/auth/signup">Get Started Free</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </nav>

        <button
          className="md:hidden p-2 relative z-50 rounded-md bg-background border border-border text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {[...leftItems, ...rightItems].map((item) =>
              renderNavLink(item, "text-sm font-medium hover:text-primary transition-colors py-2", () =>
                setMobileMenuOpen(false),
              ),
            )}
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/account/subscription"
                      className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Crown className="h-4 w-4" />
                      My Subscription
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-2 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-sm font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Button asChild className="w-full">
                      <Link href="/auth/signup">Get Started Free</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
