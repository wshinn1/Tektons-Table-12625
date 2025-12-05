import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function SectionsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  // Fetch section templates
  const { data: templates } = await supabase
    .from("section_templates")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  // Group by category
  const groupedTemplates = templates?.reduce((acc: any, template: any) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Section Gallery</h1>
          <p className="text-muted-foreground mt-2">Browse and manage reusable section templates</p>
        </div>
        <Button asChild>
          <Link href="/admin/sections/create">Create New Section</Link>
        </Button>
      </div>

      {groupedTemplates && Object.keys(groupedTemplates).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([category, templates]: [string, any]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-foreground mb-4 capitalize">{category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template: any) => (
                  <div
                    key={template.id}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url || "/placeholder.svg"}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-muted-foreground">No preview</p>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">Component: {template.component_path}</p>
                      <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                        <Link href={`/admin/sections/${template.id}/edit`}>Edit Template</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <p className="text-muted-foreground mb-4">No section templates found</p>
          <Button asChild>
            <Link href="/admin/sections/create">Create Your First Section</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
