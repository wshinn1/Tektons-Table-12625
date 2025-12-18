"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Menu, X, ExternalLink, User, Crown, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
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
    console.log("[v0] MarketingNav: Initializing auth state")
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log("[v0] MarketingNav: Got user:", user?.email)
      setUser(user)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[v0] MarketingNav: Auth state changed:", _event)
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    console.log("[v0] MarketingNav: Signing out")
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const isExternalUrl = (url: string) => url.startsWith("http://") || url.startsWith("https://")

  const renderNavLink = (item: MenuItem) => {
    const isExternal = isExternalUrl(item.url)

    const handleClick = (e: React.MouseEvent) => {
      console.log("[v0] ========== NAV LINK CLICKED ==========")
      console.log("[v0] Link:", item.label)
      console.log("[v0] URL:", item.url)
      console.log("[v0] Is external:", isExternal)
      console.log("[v0] Event type:", e.type)
      console.log("[v0] Current pathname:", window.location.pathname)
    }

    if (isExternal) {
      return (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent flex items-center gap-1"
        >
          {item.label}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
      )
    }

    return (
      <Link
        key={item.id}
        href={item.url}
        onClick={handleClick}
        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent block"
      >
        {item.label}
      </Link>
    )
  }

  const leftItems = menuItems.filter((item) => item.navigation_side === "left")
  const rightItems = menuItems.filter((item) => item.navigation_side === "right")

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

        <nav className="hidden md:flex items-center gap-1">
          {leftItems.map((item) => renderNavLink(item))}
          {rightItems.map((item) => renderNavLink(item))}

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 ml-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{user.email?.split("@")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account/subscription" className="flex items-center">
                        <Crown className="h-4 w-4 mr-2" />
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
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                  >
                    Log In
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="ml-2">Get Started Free</Button>
                  </Link>
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
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {[...leftItems, ...rightItems].map((item) => {
              const isExternal = isExternalUrl(item.url)

              if (isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      console.log("[v0] ========== MOBILE NAV LINK CLICKED ==========")
                      console.log("[v0] Link:", item.label)
                      console.log("[v0] URL:", item.url)
                    }}
                    className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1"
                  >
                    {item.label}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                )
              }

              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => {
                    console.log("[v0] ========== MOBILE NAV LINK CLICKED ==========")
                    console.log("[v0] Link:", item.label)
                    console.log("[v0] URL:", item.url)
                    setMobileMenuOpen(false)
                  }}
                  className="text-sm font-medium hover:text-primary transition-colors py-2 text-left block"
                >
                  {item.label}
                </Link>
              )
            })}
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/account/subscription"
                      onClick={() => {
                        console.log("[v0] ========== MOBILE NAV LINK CLICKED ==========")
                        console.log("[v0] Link: My Subscription")
                        console.log("[v0] URL: /account/subscription")
                        setMobileMenuOpen(false)
                      }}
                      className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-2 text-left"
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
                      onClick={() => {
                        console.log("[v0] ========== MOBILE NAV LINK CLICKED ==========")
                        console.log("[v0] Link: Log In")
                        console.log("[v0] URL: /auth/login")
                        setMobileMenuOpen(false)
                      }}
                      className="text-sm font-medium hover:text-primary transition-colors py-2 text-left"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => {
                        console.log("[v0] ========== MOBILE NAV LINK CLICKED ==========")
                        console.log("[v0] Link: Get Started Free")
                        console.log("[v0] URL: /auth/signup")
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Button className="w-full mt-2">Get Started Free</Button>
                    </Link>
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
