import { createServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { Plus, FileText, Lock, Eye } from "lucide-react"

export default async function ResourcesManagementPage() {
  const supabase = await createServerClient()

  // Fetch resources with their categories
  const { data: resources, error } = await supabase
    .from("platform_resources")
    .select(`
      *,
      categories:resource_category_assignments(
        category:resource_categories(id, name, slug, is_premium)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching resources:", error)
  }

  const publishedCount = resources?.filter((r) => r.status === "published").length || 0
  const draftCount = resources?.filter((r) => r.status === "draft").length || 0
  const premiumCount = resources?.filter((r) => r.is_premium).length || 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Premium Resources</h1>
          <p className="mt-1 text-gray-500">Manage fundraising resources and educational content</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/resources/categories">
            <Button variant="outline">Manage Categories</Button>
          </Link>
          <Link href="/admin/resources/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Resource
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Resources</div>
          <div className="text-2xl font-bold">{resources?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Published</div>
          <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Drafts</div>
          <div className="text-2xl font-bold text-amber-600">{draftCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Premium Only</div>
          <div className="text-2xl font-bold text-purple-600">{premiumCount}</div>
        </Card>
      </div>

      {!resources || resources.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No resources yet</h3>
            <p className="mt-2 text-sm text-gray-600">Get started by creating your first fundraising resource</p>
            <Link href="/admin/resources/create">
              <Button className="mt-4">Create First Resource</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{resource.title}</h3>
                    <Badge variant={resource.status === "published" ? "default" : "secondary"}>
                      {resource.status === "published"
                        ? "Published"
                        : resource.status === "archived"
                          ? "Archived"
                          : "Draft"}
                    </Badge>
                    {resource.is_premium && (
                      <Badge variant="outline" className="border-purple-500 text-purple-600">
                        <Lock className="mr-1 h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>

                  {resource.excerpt && <p className="mt-1 text-gray-600 line-clamp-2">{resource.excerpt}</p>}

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    {resource.status === "published" && resource.published_at ? (
                      <span>Published {format(new Date(resource.published_at), "MMM d, yyyy")}</span>
                    ) : (
                      <span>Last edited {format(new Date(resource.updated_at), "MMM d, yyyy")}</span>
                    )}
                    {resource.estimated_read_time > 0 && (
                      <>
                        <span>•</span>
                        <span>{resource.estimated_read_time} min read</span>
                      </>
                    )}
                    {resource.word_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{resource.word_count.toLocaleString()} words</span>
                      </>
                    )}
                  </div>

                  {resource.categories && resource.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resource.categories.map((cat: any) => (
                        <Badge
                          key={cat.category.id}
                          variant="outline"
                          className={cat.category.is_premium ? "border-purple-300 bg-purple-50" : ""}
                        >
                          {cat.category.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/resources/${resource.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {resource.status === "published" && (
                    <Link href={`/resources/article/${resource.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
