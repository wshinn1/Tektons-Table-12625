"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface HelpArticle {
  id: string
  slug: string
  title: any
  content: any
  category: string
  subcategory?: string
  is_published: boolean
  order_index: number
}

interface HelpCategory {
  id: string
  name: any
  slug: string
  icon?: string
}

export function HelpArticleManager({
  articles,
  categories,
}: {
  articles: HelpArticle[]
  categories: HelpCategory[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<HelpArticle>>({})

  const startEdit = (article: HelpArticle) => {
    setEditingId(article.id)
    setFormData({
      slug: article.slug,
      title: typeof article.title === "object" ? article.title.en : article.title,
      content: typeof article.content === "object" ? article.content.en : article.content,
      category: article.category,
      subcategory: article.subcategory,
      is_published: article.is_published,
    })
  }

  const saveArticle = async (articleId?: string) => {
    const method = articleId ? "PUT" : "POST"
    const endpoint = articleId ? `/api/admin/help/articles/${articleId}` : "/api/admin/help/articles"

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        title: { en: formData.title },
        content: { en: formData.content },
      }),
    })

    if (response.ok) {
      setEditingId(null)
      setFormData({})
      router.refresh()
    }
  }

  const deleteArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return

    const response = await fetch(`/api/admin/help/articles/${articleId}`, {
      method: "DELETE",
    })

    if (response.ok) {
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Article" : "Create New Article"}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Slug (URL)</label>
            <Input
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="how-to-accept-donations"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Title (English)</label>
            <Input
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="How to Accept Donations"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.icon} {typeof cat.name === "object" ? cat.name.en : cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Content (English, Markdown supported)</label>
            <Textarea
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your help article content here..."
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_published || false}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Published</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => saveArticle(editingId || undefined)}>
              <Save className="w-4 h-4 mr-2" />
              {editingId ? "Update" : "Create"} Article
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setFormData({})
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Articles</h2>

        {categories.map((category) => {
          const categoryArticles = articles.filter((a) => a.category === category.slug)
          if (categoryArticles.length === 0) return null

          return (
            <Card key={category.slug} className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {category.icon} {typeof category.name === "object" ? category.name.en : category.name}
              </h3>
              <div className="space-y-2">
                {categoryArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {typeof article.title === "object" ? article.title.en : article.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        /{article.slug} • {article.is_published ? "✓ Published" : "✗ Draft"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(article)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteArticle(article.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
