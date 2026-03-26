"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function TenantForgotPassword() {
  const params = useParams()
  const subdomain = params.tenant as string
  
  const isSubdomain = typeof window !== "undefined" && window.location.hostname.includes(".tektonstable.com") && !window.location.hostname.startsWith("www.")
  const loginPath = isSubdomain ? "/auth/login" : `/${subdomain}/auth/login`
  
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      const redirectUrl = `${window.location.origin}/auth/reset-password`
      console.log("[v0] Sending password reset to:", email)
      console.log("[v0] Redirect URL:", redirectUrl)

      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      console.log("[v0] Reset password response:", { error, data })

      if (error) {
        console.error("[v0] Reset password error:", error)
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error("[v0] Reset password exception:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                We've sent password reset instructions to <strong>{email}</strong>. Please check your email and click
                the link to reset your password.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              <a href={loginPath} className="flex items-center justify-center w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive password reset instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <a href={loginPath} className="text-primary hover:underline">
                Back to Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
