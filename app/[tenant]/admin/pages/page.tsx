import { getTenantPages } from "@/app/actions/tenant-pages"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PlusCircle, FileText, ExternalLink } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { DeletePageButton } from "@/components/tenant/delete-page-button"

interface Props {
  params: Promise<{
    tenant: string
  }>
}

export default async function TenantPagesPage({ params }: Props) {
  const { tenant: tenantSlug } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, page_builder_enabled")
    .eq("subdomain", tenantSlug)
    .limit(1)
    .single()

  if (!tenant) {
    notFound()
  }

  // Check if page builder is enabled
  if (!tenant.page_builder_enabled) {
    redirect(`/admin`)
  }

  const pages = await getTenantPages(tenant.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Pages</h1>
          <p className="text-muted-foreground">Create and manage custom pages for your site</p>
        </div>
        <Button asChild>
          <Link href={`/admin/pages/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {pages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No custom pages yet</p>
              <Button asChild>
                <Link href={`/admin/pages/new`}>Create your first page</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          pages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{page.title}</CardTitle>
                    <CardDescription className="font-mono text-xs">/p/{page.slug}</CardDescription>
                  </div>
                  <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Updated {new Date(page.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/pages/${page.id}/edit`}>Edit</Link>
                    </Button>
                    {page.status === "published" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/p/${page.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <DeletePageButton pageId={page.id} pageTitle={page.title} tenantSlug={tenantSlug} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
