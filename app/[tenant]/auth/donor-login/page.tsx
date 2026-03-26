"use client"

import type React from "react"
import { useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginSupporter } from "@/app/actions/supporter-auth"
import { Heart, Eye, EyeOff } from "lucide-react"

export default function DonorLoginPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = use(params)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isSubdomain = typeof window !== "undefined" && window.location.hostname.includes(".tektonstable.com") && !window.location.hostname.startsWith("www.")
  const donorPath = isSubdomain ? "/donor" : `/${tenantSlug}/donor`
  const forgotPasswordPath = isSubdomain ? "/auth/forgot-password" : `/${tenantSlug}/auth/forgot-password`
  const signupPath = isSubdomain ? "/auth/donor-signup" : `/${tenantSlug}/auth/donor-signup`
  const homePath = isSubdomain ? "/" : `/${tenantSlug}`

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginSupporter({ email, password })

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Add delay to ensure cookies are properly set before navigation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Use window.location for a full page reload to ensure server reads fresh cookies
        window.location.href = donorPath
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Donor Login</CardTitle>
          <CardDescription>Access your giving history and manage your donations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <div className="text-center text-sm">
              <a href={forgotPasswordPath} className="text-muted-foreground hover:text-primary">
                Forgot password?
              </a>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href={signupPath} className="text-primary hover:underline">
                Create one
              </a>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <a href={homePath} className="text-primary hover:underline">
                Return to site
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
