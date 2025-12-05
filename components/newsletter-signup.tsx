"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, Loader2 } from "lucide-react"

export function NewsletterSignup() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/learn-more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      setStatus("success")
      setFirstName("")
      setLastName("")
      setEmail("")
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error.message || "Failed to subscribe. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <section className="py-16 px-6 bg-accent/5 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You're on the list!</h2>
          <p className="text-muted-foreground">
            Thanks for signing up. We'll keep you updated on the latest features and news.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-6 bg-accent/5 border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
          <Mail className="w-6 h-6 text-accent" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Stay in the loop</h2>
        <p className="text-muted-foreground mb-8">
          Get updates on new features, tips for missionaries, and stories from the field.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="flex-1"
            />
            <Input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={status === "loading"} className="sm:w-auto">
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>
          {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
          <p className="text-xs text-muted-foreground">No spam, ever. Unsubscribe anytime.</p>
        </form>
      </div>
    </section>
  )
}
