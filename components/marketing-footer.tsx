"use client"

// Last updated: 2026-03-27T12:00:00Z - Added blog embed from theadoptedson.com

import Link from "next/link"
import { NewsletterSignup } from "./newsletter-signup"

// Static fallback data for v0 preview
const DEFAULT_FOOTER_SETTINGS = {
  site_title: "Tekton's Table",
  site_subtitle: "Built by storytellers for storytellers in God's kingdom.",
  copyright_text: "Tekton's Table. All rights reserved.",
  menu_columns: [
    {
      title: "Product",
      links: [
        { label: "Features", url: "/#features" },
        { label: "Pricing", url: "/pricing" },
        { label: "Example", url: "/example" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", url: "/about" },
        { label: "Privacy", url: "/privacy" },
        { label: "Terms", url: "/terms" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Contact", url: "/support" },
        { label: "Blog", url: "/blog" },
        { label: "Login", url: "/auth/login" },
      ],
    },
  ],
}

export function MarketingFooter() {
  const { site_title, site_subtitle, copyright_text, menu_columns } = DEFAULT_FOOTER_SETTINGS

  return (
    <>
      {/* Blog embed from theadoptedson.com */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <iframe
          src="https://theadoptedson.com/embed/blog-rectangular"
          width="100%"
          height="420"
          frameBorder="0"
          style={{ borderRadius: "8px", overflow: "hidden" }}
          loading="lazy"
          title="Blog posts from The Adopted Son"
        />
      </div>
      <NewsletterSignup />
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">{site_title}</h3>
              <p className="text-sm text-muted-foreground">{site_subtitle}</p>
            </div>
            {menu_columns.map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold text-foreground mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.url} className="text-sm text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {copyright_text}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
