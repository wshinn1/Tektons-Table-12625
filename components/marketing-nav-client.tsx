"use client"
import { Button } from "@/components/ui/button"
import { Menu, X, ExternalLink, User, Crown, LogOut } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
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
  const [navigating, setNavigating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
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

  const handleNavigation = useCallback(
    (url: string) => {
      if (navigating) return
      setNavigating(true)
      router.push(url)
      setTimeout(() => setNavigating(false), 500)
    },
    [navigating, router],
  )

  const leftItems = menuItems.filter((item) => item.navigation_side === "left")
  const rightItems = menuItems.filter((item) => item.navigation_side === "right")

  const isExternalUrl = (url: string) => url.startsWith("http://") || url.startsWith("https://")

  const renderNavLink = (item: MenuItem) => {
    const isExternal = isExternalUrl(item.url)

    if (isExternal) {
      return (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent flex items-center gap-1"
        >
          {item.label}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
      )
    }

    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.url)}
        disabled={navigating}
        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent block disabled:opacity-50"
      >
        {item.label}
      </button>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-2">
          <button onClick={() => handleNavigation("/")} className="flex items-center gap-2" disabled={navigating}>
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
          </button>
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
                    <DropdownMenuItem onClick={() => handleNavigation("/account/subscription")}>
                      <Crown className="h-4 w-4 mr-2" />
                      My Subscription
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
                  <button
                    onClick={() => handleNavigation("/auth/login")}
                    disabled={navigating}
                    className="text-sm font-medium hover:text-primary transition-colors px-4 py-2 disabled:opacity-50"
                  >
                    Log In
                  </button>
                  <button onClick={() => handleNavigation("/auth/signup")} disabled={navigating}>
                    <Button className="ml-2" disabled={navigating}>
                      Get Started Free
                    </Button>
                  </button>
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
                    className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1"
                  >
                    {item.label}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                )
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.url)
                    setMobileMenuOpen(false)
                  }}
                  disabled={navigating}
                  className="text-sm font-medium hover:text-primary transition-colors py-2 text-left block disabled:opacity-50"
                >
                  {item.label}
                </button>
              )
            })}
            {!loading && (
              <>
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        handleNavigation("/account/subscription")
                        setMobileMenuOpen(false)
                      }}
                      disabled={navigating}
                      className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-2 text-left disabled:opacity-50"
                    >
                      <Crown className="h-4 w-4" />
                      My Subscription
                    </button>
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
                    <button
                      onClick={() => {
                        handleNavigation("/auth/login")
                        setMobileMenuOpen(false)
                      }}
                      disabled={navigating}
                      className="text-sm font-medium hover:text-primary transition-colors py-2 text-left disabled:opacity-50"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        handleNavigation("/auth/signup")
                        setMobileMenuOpen(false)
                      }}
                      disabled={navigating}
                    >
                      <Button className="w-full mt-2" disabled={navigating}>
                        Get Started Free
                      </Button>
                    </button>
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
