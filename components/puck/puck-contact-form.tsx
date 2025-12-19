"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { submitContactMessage } from "@/app/actions/contact"
import { CheckCircle2, Send } from "lucide-react"

interface PuckContactFormProps {
  tenantId: string
  title: string
  description?: string
  submitText: string
  showSubject: "yes" | "no"
}

export function PuckContactForm({ tenantId, title, description, submitText, showSubject }: PuckContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await submitContactMessage(tenantId, formData)

    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } else {
      setError(result.error || "Failed to send message. Please try again.")
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Message Sent Successfully!</h3>
            <p className="text-sm">We'll get back to you as soon as possible.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg border">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="puck-contact-name" className="block text-sm font-medium mb-1">
            Name *
          </Label>
          <Input
            id="puck-contact-name"
            name="name"
            type="text"
            placeholder="Your name"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="puck-contact-email" className="block text-sm font-medium mb-1">
            Email *
          </Label>
          <Input
            id="puck-contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            disabled={isSubmitting}
          />
        </div>
        {showSubject === "yes" && (
          <div>
            <Label htmlFor="puck-contact-subject" className="block text-sm font-medium mb-1">
              Subject
            </Label>
            <Input id="puck-contact-subject" name="subject" type="text" placeholder="Subject" disabled={isSubmitting} />
          </div>
        )}
        <div>
          <Label htmlFor="puck-contact-message" className="block text-sm font-medium mb-1">
            Message *
          </Label>
          <Textarea
            id="puck-contact-message"
            name="message"
            placeholder="Your message"
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {submitText}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
