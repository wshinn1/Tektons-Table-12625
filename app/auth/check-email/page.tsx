"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resendConfirmationEmail } from "@/app/actions/auth"
import Link from "next/link"
import { Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function CheckEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Resend button clicked, email:", email)

    if (!email) {
      console.log("[v0] No email provided")
      setStatus("error")
      setMessage("Please enter your email address")
      return
    }

    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    console.log("[v0] Calling resendConfirmationEmail server action")
    const result = await resendConfirmationEmail(email)
    console.log("[v0] Server action result:", result)

    if (result.error) {
      console.log("[v0] Resend failed with error:", result.error)
      setStatus("error")
      setMessage(result.error)
    } else {
      console.log("[v0] Resend succeeded")
      setStatus("success")
      setMessage("Confirmation email sent! Please check your inbox.")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p>
                Please check your email and click the confirmation link to activate your account. After confirming,
                you&apos;ll be redirected to complete your profile setup.
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="mb-4 text-sm font-medium">Didn&apos;t receive the email?</p>
              <form onSubmit={handleResend} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Your email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter the email you signed up with"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {status === "success" && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    {message}
                  </div>
                )}

                {status === "error" && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {message}
                  </div>
                )}

                <Button type="submit" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Confirmation Email
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="border-t pt-4 text-center text-sm text-muted-foreground">
              <p className="mb-2">Still having trouble? Check your spam folder.</p>
              <Link href="/auth/login" className="text-primary underline underline-offset-4">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
