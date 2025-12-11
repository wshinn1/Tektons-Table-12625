"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"
import { useState, useEffect } from "react"
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  user: User
}

interface NavItem {
  label: string
  href: string
  icon: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", href: "/admin", icon: "🏠" },
      { label: "Analytics", href: "/admin/analytics", icon: "📊" },
      { label: "Example", href: "/admin/example", icon: "🌐" }, // Added Example menu item to show embedded tenant site
    ],
  },
  {
    title: "Page Editors",
    items: [
      { label: "Homepage Editor", href: "/admin/homepage-editor", icon: "🏠" },
      { label: "About Editor", href: "/admin/about-editor", icon: "👤" },
      { label: "How It Works Editor", href: "/admin/how-it-works-editor", icon: "⚙️" },
      { label: "Pricing Editor", href: "/admin/pricing-editor", icon: "💰" },
      { label: "Security Editor", href: "/admin/security-editor", icon: "🔒" },
      { label: "Help Editor", href: "/admin/help/manage", icon: "❓" },
      { label: "Blog Page Editor", href: "/admin/blog-page-editor", icon: "📰" }, // Added Blog Page Editor to sidebar
    ],
  },
  {
    title: "Content Management",
    items: [
      { label: "Announcement Banner", href: "/admin/banner", icon: "📢" },
      { label: "Blog Posts", href: "/admin/blog", icon: "📝" },
      { label: "Blog Analytics", href: "/admin/blog/analytics", icon: "📈" },
      { label: "Premium Resources", href: "/admin/resources", icon: "📚" }, // Added Premium Resources link
      { label: "Comped Access", href: "/admin/comped-access", icon: "🎁" }, // Added Comped Access link for Phase 6
      { label: "Pages", href: "/admin/pages", icon: "📑" },
      { label: "Sections", href: "/admin/sections", icon: "🧩" },
      { label: "Site Content", href: "/admin/site-content", icon: "✏️" },
      { label: "Demo Site", href: "/admin/demo-site", icon: "🎨" },
      { label: "Menu Navigation", href: "/admin/menu-navigation", icon: "🍔" },
      { label: "Global Sections", href: "/admin/global-sections", icon: "🌐" },
      { label: "Section Gallery", href: "/admin/section-gallery", icon: "🖼️" },
      { label: "Drafts", href: "/admin/drafts", icon: "📄" },
    ],
  },
  {
    title: "Marketing & CRM",
    items: [
      { label: "Contacts", href: "/admin/contacts", icon: "👤" },
      { label: "Contact Groups", href: "/admin/contact-groups", icon: "👥" },
      { label: "Newsletters", href: "/admin/newsletters", icon: "📧" },
      { label: "Email Workflows", href: "/admin/workflows", icon: "🔄" },
    ],
  },
  {
    title: "Financials",
    items: [{ label: "Platform Revenue", href: "/admin/platform-revenue", icon: "💰" }],
  },
  {
    title: "Tenants",
    items: [
      { label: "List", href: "/admin/tenants", icon: "👥" },
      { label: "Settings", href: "/admin/tenants/settings", icon: "⚙️" },
      { label: "Non-Profit Apps", href: "/admin/nonprofit-applications", icon: "✅" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Site Settings", href: "/admin/settings/site", icon: "🌐" },
      { label: "Backup Management", href: "/admin/backups", icon: "💾" },
      { label: "Backup Settings", href: "/admin/backup-settings", icon: "⚙️" },
      { label: "Logs", href: "/admin/system/logs", icon: "📜" },
      { label: "Updates", href: "/admin/system/updates", icon: "🔄" },
    ],
  },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Dashboard: true,
    "Page Editors": true, // Always expanded
    "Content Management": true,
    "Marketing & CRM": true,
    Financials: true,
    Tenants: true,
    System: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed")
    if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
    localStorage.removeItem("admin-sidebar-sections") // Clear any cached collapsed state for sections and reset to all expanded
  }, [])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("admin-sidebar-collapsed", String(newState))
  }

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-transparent"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500 mt-1 truncate">Welcome, {user.email?.split("@")[0]}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="hidden md:flex shrink-0 hover:bg-gray-100"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navSections.map((section) => {
            const isDashboard = section.title === "Dashboard"
            const isPageEditors = section.title === "Page Editors"
            const isExpanded = expandedSections[section.title]

            return (
              <div key={section.title}>
                {isDashboard ? (
                  section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        isCollapsed && "justify-center",
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  ))
                ) : (
                  <>
                    {!isCollapsed && (
                      <button
                        onClick={() => toggleSection(section.title)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                      >
                        <span className={cn("transition-transform", isExpanded ? "rotate-90" : "")}>▸</span>
                        {section.title}
                      </button>
                    )}

                    {(isCollapsed || isExpanded) && (
                      <div className={cn("space-y-0.5", !isCollapsed && "ml-2 mt-1")}>
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive(item.href)
                                ? "bg-gray-100 text-gray-900 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                              isCollapsed && "justify-center",
                            )}
                          >
                            <span className="text-base">{item.icon}</span>
                            {!isCollapsed && <span>{item.label}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            title={isCollapsed ? "Back to Site" : undefined}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors",
              isCollapsed && "justify-center",
            )}
          >
            <span>←</span>
            {!isCollapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>
    </>
  )
}
