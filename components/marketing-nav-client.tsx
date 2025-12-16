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
import { motion } from "framer-motion"

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

  const menuItemGradients = [
    "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)", // blue
    "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)", // orange
    "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)", // green
    "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)", // red
    "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)", // purple
    "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(219,39,119,0.06) 50%, rgba(190,24,93,0) 100%)", // pink
    "radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(2,132,199,0.06) 50%, rgba(3,105,161,0) 100%)", // cyan
  ]

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: 1,
      scale: 2,
      transition: {
        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
      },
    },
  }

  const renderAnimatedNavLink = (item: MenuItem, index: number) => {
    const gradient = menuItemGradients[index % menuItemGradients.length]
    const isExternal = isExternalUrl(item.url)

    return (
      <motion.div key={item.id} className="relative" whileHover="hover" initial="initial">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none rounded-xl"
          variants={glowVariants}
          style={{
            background: gradient,
            opacity: 0,
          }}
        />

        {/* Single clickable link - no more front/back face flip that blocked clicks */}
        <motion.div
          className="relative z-10"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isExternal ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl"
            >
              {item.label}
              <ExternalLink className="inline-block ml-1 h-3 w-3 opacity-50" />
            </a>
          ) : (
            <Link
              href={item.url}
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl"
            >
              {item.label}
            </Link>
          )}
        </motion.div>
      </motion.div>
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

        <nav className="hidden md:flex items-center gap-2">
          {/* Animated left navigation items */}
          {leftItems.map((item, index) => renderAnimatedNavLink(item, index))}

          {/* Animated right navigation items */}
          {rightItems.map((item, index) => renderAnimatedNavLink(item, leftItems.length + index))}

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
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                  >
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
            {[...leftItems, ...rightItems].map((item, index) => renderAnimatedNavLink(item, index))}
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
