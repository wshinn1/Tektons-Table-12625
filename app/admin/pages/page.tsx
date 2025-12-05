import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPages } from "@/app/actions/pages"
import { SetHomepageButton } from "@/components/admin/set-homepage-button"
import { Home, Info, Cog, DollarSign, Shield, HelpCircle, FileText, Paintbrush, Layers } from "lucide-react"

const builtInPageEditors = [
  {
    title: "Homepage",
    description: "Edit the main landing page sections",
    href: "/admin/homepage-editor",
    icon: Home,
    slug: "/",
  },
  {
    title: "About",
    description: "Edit the about page sections",
    href: "/admin/about-editor",
    icon: Info,
    slug: "/about",
  },
  {
    title: "How It Works",
    description: "Edit the how it works page sections",
    href: "/admin/how-it-works-editor",
    icon: Cog,
    slug: "/how-it-works",
  },
  {
    title: "Pricing",
    description: "Edit the pricing page sections",
    href: "/admin/pricing-editor",
    icon: DollarSign,
    slug: "/pricing",
  },
  {
    title: "Security",
    description: "Edit the security page sections",
    href: "/admin/security-editor",
    icon: Shield,
    slug: "/security",
  },
  {
    title: "Help Center",
    description: "Manage help articles and categories",
    href: "/admin/help/manage",
    icon: HelpCircle,
    slug: "/help",
  },
]

export default async function PagesManagementPage() {
  const pages = await getPages()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages & Sections</h1>
          <p className="text-gray-500 mt-1">Manage all pages from one place</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/create">Create New Page</Link>
        </Button>
      </div>

      {/* Built-in Page Editors */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Built-in Page Editors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builtInPageEditors.map((editor) => {
            const Icon = editor.icon
            return (
              <Card key={editor.href} className="p-6 hover:shadow-md transition-shadow">
                <Link href={editor.href} className="block">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{editor.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{editor.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{editor.slug}</p>
                    </div>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Custom Pages */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Pages</h2>
        <div className="grid gap-4">
          {pages.length > 0 ? (
            pages.map((page) => {
              const isUnlayer = page.editor_type === "unlayer"
              const editHref = isUnlayer ? `/admin/pages/${page.slug}/builder` : `/admin/pages/${page.slug}/edit`
              const EditorIcon = isUnlayer ? Paintbrush : Layers

              return (
                <Card key={page.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          {page.title}
                          {page.is_homepage && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Homepage</span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              isUnlayer ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <EditorIcon className="h-3 w-3" />
                            {isUnlayer ? "Visual Builder" : "Sections"}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">/p/{page.slug}</p>
                        {page.meta_description && <p className="text-sm text-gray-600 mt-2">{page.meta_description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        {page.is_published ? (
                          <span className="text-green-600 font-medium">Published</span>
                        ) : (
                          <span className="text-gray-500">Draft</span>
                        )}
                      </div>
                      {!page.is_homepage && <SetHomepageButton pageId={page.id} pageTitle={page.title} />}
                      <Button asChild variant="outline">
                        <Link href={editHref}>
                          <EditorIcon className="h-4 w-4 mr-2" />
                          Edit Page
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">No custom pages yet.</p>
              <Button asChild>
                <Link href="/admin/pages/create">Create Your First Page</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
