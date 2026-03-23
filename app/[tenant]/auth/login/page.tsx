"use client"

import type React from "react"
import { Suspense } from "react"

import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams, useParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

// Tenant admin login form with enhanced error messaging
function TenantLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const params = useParams()

  const redirectTo = searchParams.get("redirect") || "/admin/giving"
  const subdomain = params.tenant as string

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient()
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (data.session) {
        // Force a session refresh to ensure cookies are properly set
        await supabase.auth.refreshSession()
        
        // Verify the session is actually persisted
        const { data: finalCheck } = await supabase.auth.getSession()
        
        if (!finalCheck?.session) {
          setError("Session could not be established. Please try again or clear your browser cookies.")
          return
        }
        
        // Add delay to ensure cookies are fully propagated before navigation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Use window.location for a full page reload to ensure cookies are read fresh
        window.location.href = redirectTo
      }
    } catch (err: any) {
      // Provide more helpful error messages
      const errorMessage = err.message || "Failed to sign in"
      if (errorMessage.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials and try again, or use the 'Forgot password?' link to reset your password.")
      } else if (errorMessage.includes("Email not confirmed")) {
        setError("Please confirm your email address before signing in. Check your inbox for a confirmation link.")
      } else if (errorMessage.includes("Too many requests")) {
        setError("Too many login attempts. Please wait a few minutes and try again.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Sign in to manage your site</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href={`/${subdomain}/auth/forgot-password`} className="text-sm text-muted-foreground hover:text-primary">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link href={`/${subdomain}`} className="text-muted-foreground hover:underline">
                ← Back to site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TenantLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <TenantLoginForm />
    </Suspense>
  )
}
