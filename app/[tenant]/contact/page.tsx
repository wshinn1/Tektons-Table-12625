import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ContactForm } from "@/components/tenant/contact-form"

export default async function ContactPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", tenantSlug).maybeSingle()

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              {tenant.name}
            </Link>
            <nav className="flex gap-6">
              <Link href="/posts" className="text-muted-foreground hover:text-foreground">
                Updates
              </Link>
              <Link href="/donate" className="text-muted-foreground hover:text-foreground">
                Donate
              </Link>
              <Link href="/contact" className="font-medium">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Get in Touch</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Have questions or want to learn more about the ministry? I'd love to hear from you.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <ContactForm tenantId={tenant.id} tenantName={tenant.name} />
          </div>
        </div>
      </section>
    </div>
  )
}
