"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getNewsletters } from "@/app/actions/newsletter"
import { toast } from "sonner"
import { Mail, Eye, MousePointerClick, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

interface Newsletter {
  id: string
  subject: string
  status: "draft" | "scheduled" | "sent"
  sent_at: string | null
  recipient_count: number
  open_count: number
  click_count: number
  created_at: string
}

export function NewslettersList({ tenantId, subdomain, statusFilter }: { tenantId: string; subdomain: string; statusFilter?: "draft" | "sent" }) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadNewsletters()
  }, [tenantId])

  const loadNewsletters = async () => {
    try {
      const data = await getNewsletters(tenantId)
      const filtered = statusFilter ? data.filter((n: Newsletter) => n.status === statusFilter) : data
      setNewsletters(filtered)
    } catch (error) {
      toast.error("Failed to load newsletters")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/${subdomain}/admin/newsletter/edit/${id}`)
  }

  const title = statusFilter === "draft" ? "Draft Newsletters" : "Sent Newsletters"
  const description =
    statusFilter === "draft"
      ? "Continue working on your draft newsletters"
      : "View your newsletter history and performance"
  const emptyMessage = statusFilter === "draft" ? "No draft newsletters." : "No newsletters sent yet."

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading newsletters...</p>
        ) : newsletters.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {newsletters.map((newsletter) => (
              <div key={newsletter.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{newsletter.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {newsletter.sent_at
                        ? new Date(newsletter.sent_at).toLocaleDateString()
                        : `Created ${new Date(newsletter.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={newsletter.status === "sent" ? "default" : "secondary"}>{newsletter.status}</Badge>
                    {newsletter.status === "draft" && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(newsletter.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                {newsletter.status === "sent" && (
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{newsletter.recipient_count} sent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{newsletter.open_count} opens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <span>{newsletter.click_count} clicks</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
