import Link from "next/link"
import { NewsletterSignup } from "./newsletter-signup"
import { getFooterSettings } from "@/app/actions/footer-settings"

export async function MarketingFooter() {
  const footerSettings = await getFooterSettings()

  // Fallback to defaults if settings not found
  const siteTitle = footerSettings?.site_title || "Tekton's Table"
  const siteSubtitle = footerSettings?.site_subtitle || "Built by storytellers for storytellers in God's kingdom."
  const copyrightText = footerSettings?.copyright_text || "Tekton's Table. All rights reserved."
  const menuColumns = footerSettings?.menu_columns || [
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
  ]

  return (
    <>
      <NewsletterSignup />
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">{siteTitle}</h3>
              <p className="text-sm text-muted-foreground">{siteSubtitle}</p>
            </div>
            {menuColumns.map((column, index) => (
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
              © {new Date().getFullYear()} {copyrightText}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
