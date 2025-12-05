"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Trash2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  created_at: string
}

export function ContactSubmissionsManager({ tenantId }: { tenantId: string }) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/tenant/contact-submissions?tenantId=${tenantId}`)
      if (!res.ok) throw new Error("Failed to fetch submissions")
      const data = await res.json()
      setSubmissions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSubmission = async (id: string) => {
    if (!confirm("Delete this submission?")) return

    try {
      const res = await fetch(`/api/tenant/contact-submissions/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Submission deleted",
      })

      fetchSubmissions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading submissions...</div>
  }

  if (submissions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
        <p className="text-muted-foreground">Contact form submissions will appear here</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold">{submission.name}</h3>
                {submission.subject && <p className="text-sm text-muted-foreground">{submission.subject}</p>}
                <Badge variant="outline" className="mt-1">
                  {new Date(submission.created_at).toLocaleDateString()}
                </Badge>
              </div>

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                    {submission.email}
                  </a>
                </div>
                {submission.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${submission.phone}`} className="text-blue-600 hover:underline">
                      {submission.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteSubmission(submission.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
