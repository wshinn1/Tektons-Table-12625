"use client"

import type React from "react"
import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("[v0] Donor login - attempting login for:", email)
      const result = await loginSupporter({ email, password })
      console.log("[v0] Donor login - result:", result)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        console.log("[v0] Donor login - success, waiting for cookies to propagate")
        // Add delay to ensure cookies are properly set before navigation
        // This prevents the login loop on slower connections
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Use window.location for a full page reload to ensure server reads fresh cookies
        // router.push/refresh can cause race conditions with cookie propagation
        const targetUrl = `/${tenantSlug}/donor`
        console.log("[v0] Donor login - redirecting to:", targetUrl)
        window.location.href = targetUrl
      }
    } catch (err) {
      console.log("[v0] Donor login - error:", err)
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
              <Link href={`/${tenantSlug}/auth/supporter-forgot-password`} className="text-muted-foreground hover:text-primary">
                Forgot password?
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href={`/${tenantSlug}/auth/donor-signup`} className="text-primary hover:underline">
                Create one
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Link href={`/${tenantSlug}`} className="text-primary hover:underline">
                Return to site
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
