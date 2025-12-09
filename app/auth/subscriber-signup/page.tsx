"use client"

import type React from "react"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

function SubscriberSignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("redirect")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Sign out any existing session first
      await supabase.auth.signOut()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          throw new Error("This email is already registered. Please log in instead.")
        }
        throw error
      }

      // Check if email confirmation is required
      const hasIdentities = data?.user?.identities && data.user.identities.length > 0

      if (!hasIdentities) {
        setError("This email is already registered. Please log in instead.")
        setIsLoading(false)
        return
      }

      // Try to sign in immediately (works if email confirmation is disabled)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Email confirmation required
        router.push("/auth/check-email")
      } else if (signInData.session) {
        // Successfully signed in, redirect to premium content
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          router.push("/")
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Sign up to subscribe to premium content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Smith"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link
                  href={redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login"}
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
              <div className="mt-2 text-center text-sm text-muted-foreground">
                Want to create a fundraising page?{" "}
                <Link href="/auth/signup" className="underline underline-offset-4">
                  Sign up as a missionary
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SubscriberSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <SubscriberSignupForm />
    </Suspense>
  )
}
