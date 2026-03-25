import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { headers } from "next/headers"

export async function TenantLayout({
  children,
  tenantSlug,
  tenantName,
}: {
  children: React.ReactNode
  tenantSlug: string
  tenantName: string
}) {
  const headersList = await headers()
  const subdomain = headersList.get("x-tenant-subdomain") || ""
  const isSubdomain = subdomain === tenantSlug

  const basePath = isSubdomain ? "" : `/${tenantSlug}`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center justify-between h-16">
            <Link href={`${basePath}/`} className="font-bold text-xl">
              {tenantName}
            </Link>
            <div className="flex items-center gap-6">
              <Link href={`${basePath}/`} className="text-sm hover:text-primary transition-colors">
                Home
              </Link>
              <Link href={`${basePath}/posts`} className="text-sm hover:text-primary transition-colors">
                Updates
              </Link>
              <Link href={`${basePath}/campaigns`} className="text-sm hover:text-primary transition-colors">
                Campaigns
              </Link>
              <Link href={`${basePath}/contact`} className="text-sm hover:text-primary transition-colors">
                Contact
              </Link>
              <Button size="sm" asChild>
                <Link href={`${basePath}/donate`}>Donate</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-foreground">{tenantName}</h3>
              <p className="text-sm text-muted-foreground">Thank you for your partnership in ministry.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`${basePath}/posts`} className="text-muted-foreground hover:text-foreground">
                    Updates
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/campaigns`} className="text-muted-foreground hover:text-foreground">
                    Campaigns
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/donate`} className="text-muted-foreground hover:text-foreground">
                    Donate
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`${basePath}/contact`} className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/help`} className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/privacy`} className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/terms`} className="text-muted-foreground hover:text-foreground">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              Powered by{" "}
              <Link href="https://tektonstable.com" className="hover:text-foreground inline-flex items-center gap-2">
                <Image
                  src="/tektons-table-logo.png"
                  alt="Tekton's Table"
                  width={120}
                  height={40}
                  className="h-6 w-auto"
                />
                Tekton's Table
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
