"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react"
import { requestPageBuilder } from "@/app/actions/tenant-settings"

interface PageBuilderRequestProps {
  tenantId: string
  tenantName: string
  tenantEmail: string
  hasRequested: boolean
  hasPlasmic: boolean
}

export function PageBuilderRequest({
  tenantId,
  tenantName,
  tenantEmail,
  hasRequested,
  hasPlasmic,
}: PageBuilderRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Get tenant subdomain from URL
      const tenantSlug = window.location.pathname.split("/")[1]
      const result = await requestPageBuilder(tenantSlug)

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "Failed to submit request")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasPlasmic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Page Builder</CardTitle>
          <CardDescription>Visual page builder powered by Plasmic</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your custom page builder is active! You can now create visually rich pages using Plasmic Studio.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild variant="outline">
              <a href="/admin/pages/new" className="flex items-center gap-2">
                Create New Page
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasRequested || success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Page Builder</CardTitle>
          <CardDescription>Request status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your request has been received! We'll set up your custom page builder and notify you when it's ready. This
              typically takes 1-2 business days.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Custom Page Builder</CardTitle>
        <CardDescription>
          Get access to an advanced visual page builder to create custom landing pages, donation pages, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Additional Details (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your specific needs or any questions you have..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              The custom page builder uses Plasmic, a professional visual design tool that lets you create beautiful
              pages without coding.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request Page Builder
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
