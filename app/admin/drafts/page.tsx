import { getDraftPages } from "@/app/actions/drafts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DraftsPage() {
  const drafts = await getDraftPages()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700"
      case "review":
        return "bg-yellow-100 text-yellow-700"
      case "approved":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "marketing":
        return "bg-blue-100 text-blue-700"
      case "legal":
        return "bg-purple-100 text-purple-700"
      case "support":
        return "bg-orange-100 text-orange-700"
      case "about":
        return "bg-teal-100 text-teal-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Draft Pages</h1>
          <p className="text-gray-600 mt-1">Create HTML drafts to plan frontend content and layout</p>
        </div>
        <Button asChild>
          <Link href="/admin/drafts/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Draft
          </Link>
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No draft pages yet</p>
              <Button asChild>
                <Link href="/admin/drafts/new">Create Your First Draft</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(draft.category)}>{draft.category}</Badge>
                      <Badge className={getStatusColor(draft.status)}>{draft.status}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-1">{draft.title}</CardTitle>
                    <CardDescription>/{draft.slug}</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/drafts/${draft.id}`}>Edit</Link>
                  </Button>
                </div>
              </CardHeader>
              {draft.notes && (
                <CardContent>
                  <p className="text-sm text-gray-600">{draft.notes}</p>
                </CardContent>
              )}
              <CardContent className="pt-0">
                <p className="text-xs text-gray-400">Last updated: {new Date(draft.updated_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
