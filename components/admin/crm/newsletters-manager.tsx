"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Mail, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Newsletter {
  id: string
  subject: string
  preview_text: string
  status: "draft" | "scheduled" | "sending" | "sent"
  recipient_count: number
  sent_count: number
  opened_count: number
  clicked_count: number
  created_at: string
  sent_at: string
}

export function NewslettersManager() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const res = await fetch("/api/admin/newsletters")
      if (!res.ok) throw new Error("Failed to fetch newsletters")
      const data = await res.json()
      setNewsletters(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load newsletters",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this newsletter?")) return

    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete newsletter")

      toast({
        title: "Success",
        description: "Newsletter deleted successfully",
      })

      fetchNewsletters()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete newsletter",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "sending":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading newsletters...</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => router.push("/admin/newsletters/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Newsletter
        </Button>
      </div>

      <div className="space-y-4">
        {newsletters.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No newsletters yet</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first newsletter</p>
            <Button onClick={() => router.push("/admin/newsletters/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Newsletter
            </Button>
          </Card>
        ) : (
          newsletters.map((newsletter) => (
            <Card key={newsletter.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{newsletter.subject}</h3>
                    <Badge className={getStatusColor(newsletter.status)}>{newsletter.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{newsletter.preview_text}</p>

                  {newsletter.status === "sent" && (
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sent: </span>
                        <span className="font-medium">{newsletter.sent_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Opened: </span>
                        <span className="font-medium">
                          {newsletter.opened_count} (
                          {newsletter.sent_count > 0
                            ? Math.round((newsletter.opened_count / newsletter.sent_count) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clicked: </span>
                        <span className="font-medium">
                          {newsletter.clicked_count} (
                          {newsletter.sent_count > 0
                            ? Math.round((newsletter.clicked_count / newsletter.sent_count) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/newsletters/${newsletter.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {newsletter.status === "draft" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/newsletters/${newsletter.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(newsletter.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
