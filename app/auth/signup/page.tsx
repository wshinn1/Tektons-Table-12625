"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Badge } from "@/components/ui/badge"

function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [sessionCleared, setSessionCleared] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const refCode = searchParams.get("ref")
  const [referrerName, setReferrerName] = useState<string | null>(null)

  useEffect(() => {
    const clearStaleSession = async () => {
      const supabase = createClient()
      console.log("[v0] Signup page loaded - checking for stale sessions...")

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log("[v0] Found existing session, signing out to prevent conflicts...")
          await supabase.auth.signOut()
          console.log("[v0] Signed out stale session successfully")
        } else {
          console.log("[v0] No existing session found")
        }
      } catch (err) {
        console.log("[v0] Error checking/clearing session (this is OK):", err)
        // Try to sign out anyway in case there's a corrupted session
        try {
          await supabase.auth.signOut()
        } catch {
          // Ignore errors here
        }
      }

      setSessionCleared(true)
    }

    clearStaleSession()
  }, [])

  useEffect(() => {
    if (refCode) {
      const fetchReferrer = async () => {
        const supabase = createClient()
        const { data } = await supabase.from("referral_codes").select("tenants(full_name)").eq("code", refCode).single()

        if (data?.tenants) {
          setReferrerName(data.tenants.full_name)
        }
      }
      fetchReferrer()
    }
  }, [refCode])

  const checkSubdomain = async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setSubdomain(cleaned)

    if (cleaned.length < 3) {
      setSubdomainAvailable(null)
      return
    }

    const supabase = createClient()
    const { data } = await supabase.from("tenants").select("subdomain").eq("subdomain", cleaned).maybeSingle()

    setSubdomainAvailable(!data)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] ========== SIGNUP PROCESS START ==========")
    console.log("[v0] Full Name:", fullName)
    console.log("[v0] Email:", email)
    console.log("[v0] Subdomain:", subdomain)
    console.log("[v0] Referral Code:", refCode || "none")
    console.log("[v0] Terms Accepted:", acceptedTerms)
    console.log("[v0] Session Cleared:", sessionCleared)

    if (!subdomainAvailable) {
      console.log("[v0] ERROR: Subdomain not available")
      setError("Please choose an available subdomain")
      return
    }

    if (!acceptedTerms) {
      console.log("[v0] ERROR: Terms not accepted")
      setError("You must accept the Terms and Conditions to continue")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Ensuring clean session state before signup...")
      await supabase.auth.signOut()

      console.log("[v0] Calling Supabase signUp...")
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      const redirectUrl = isLocalhost
        ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback?next=/onboarding`
        : `${window.location.origin}/auth/callback?next=/onboarding`
      console.log("[v0] Redirect URL:", redirectUrl)
      console.log("[v0] Is localhost:", isLocalhost)
      console.log("[v0] Window origin:", window.location.origin)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            subdomain: subdomain,
            referral_code: refCode || null,
          },
        },
      })

      if (error) {
        console.log("[v0] ERROR: Supabase signUp failed")
        console.log("[v0] Error code:", error.status)
        console.log("[v0] Error message:", error.message)
        console.log("[v0] Full error:", JSON.stringify(error, null, 2))

        if (error.message.includes("already registered")) {
          throw new Error("This email is already registered. Please try logging in instead, or use a different email.")
        }
        if (error.message.includes("Invalid Refresh Token")) {
          throw new Error("Session error. Please refresh the page and try again.")
        }
        throw error
      }

      console.log("[v0] SUCCESS: User created")
      console.log("[v0] User ID:", data?.user?.id)
      console.log("[v0] User Email:", data?.user?.email)
      console.log("[v0] User Email Confirmed:", data?.user?.email_confirmed_at ? "Yes" : "No")
      console.log("[v0] Session:", data?.session ? "Created" : "None")
      console.log("[v0] Metadata saved:", data?.user?.user_metadata)

      const hasSession = !!data?.session
      const userCreated = !!data?.user
      const hasIdentities = data?.user?.identities && data.user.identities.length > 0

      console.log("[v0] Post-signup state:")
      console.log("[v0] - Has session:", hasSession)
      console.log("[v0] - User created:", userCreated)
      console.log("[v0] - Has identities:", hasIdentities)

      // try to sign in and go to onboarding. Empty identities = email already exists.
      if (!hasIdentities) {
        // Empty identities means the email was already registered
        console.log("[v0] ERROR: Empty identities - email already registered")
        setError("This email is already registered. Please try logging in instead.")
        setIsLoading(false)
        return
      }

      // If it works, we go to onboarding. If it fails, user needs to confirm email.
      console.log("[v0] Attempting to sign in after signup...")
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.log("[v0] Sign in failed:", signInError.message)
        // Sign in failed - likely means email confirmation is required
        console.log("[v0] ========== REDIRECTING TO CHECK EMAIL ==========")
        router.push("/auth/check-email")
      } else {
        console.log("[v0] Sign in successful!")
        console.log("[v0] Session user:", signInData.user?.email)
        console.log("[v0] ========== REDIRECTING TO ONBOARDING ==========")
        router.push("/onboarding")
      }
    } catch (error: unknown) {
      console.log("[v0] CATCH ERROR:", error)
      setError(error instanceof Error ? error.message : "An error occurred during signup. Please try again.")
    } finally {
      setIsLoading(false)
      console.log("[v0] ========== SIGNUP PROCESS END ==========")
    }
  }

  if (!sessionCleared) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Join Tekton's Table</CardTitle>
          <CardDescription>Preparing signup form...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {referrerName ? `Join ${referrerName} on Tekton's Table` : "Join Tekton's Table"}
        </CardTitle>
        <CardDescription>Create your free missionary fundraising account</CardDescription>
        {refCode && (
          <Badge variant="default" className="mt-2">
            🎉 Welcome Discount: 2.5% for first 30 days (save 28.5%!)
          </Badge>
        )}
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
              <Label htmlFor="subdomain">Choose Your URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  type="text"
                  placeholder="john-smith"
                  required
                  value={subdomain}
                  onChange={(e) => checkSubdomain(e.target.value)}
                  className={subdomain.length >= 3 ? (subdomainAvailable ? "border-green-500" : "border-red-500") : ""}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.tektonstable.com</span>
              </div>
              {subdomain.length >= 3 && (
                <p className={`text-xs ${subdomainAvailable ? "text-green-600" : "text-red-600"}`}>
                  {subdomainAvailable ? "✓ Available" : "✗ Already taken"}
                </p>
              )}
              <p className="text-xs text-muted-foreground">This will be your fundraising page URL</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="missionary@example.com"
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
            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the Terms and Conditions and Privacy Policy
                  </label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By signing up, you agree to our{" "}
                    <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-foreground">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Privacy Policy
                    </Link>
                    . This includes accepting the 3.5% platform fee on all donations and understanding that funds are
                    processed directly through your Stripe account.
                  </p>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !subdomainAvailable || !acceptedTerms}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Join Tekton's Table</CardTitle>
                <CardDescription>Loading...</CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
