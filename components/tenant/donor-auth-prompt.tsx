"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCircle, LogIn, CheckCircle } from "lucide-react"
import { loginSupporter } from "@/app/actions/supporter-auth"
import Link from "next/link"
import { useParams } from "next/navigation"

export function DonorAuthPrompt({
  tenantId,
  currentEmail,
  supporterName,
  isSubdomain = false,
}: {
  tenantId: string
  currentEmail?: string
  supporterName?: string
  isSubdomain?: boolean
}) {
  const params = useParams()
  const tenantSlug = params.tenant as string

  const basePath = isSubdomain ? "" : `/${tenantSlug}`

  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await loginSupporter({ email, password })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      // Refresh the page to show logged-in state
      window.location.reload()
    }
  }

  if (currentEmail) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                {supporterName ? `Welcome back, ${supporterName}!` : `Signed in as ${currentEmail}`}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">This donation will be linked to your account</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!showLogin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Have an account?
          </CardTitle>
          <CardDescription>
            Sign in to track your donations, manage recurring gifts, and view your giving history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button onClick={() => setShowLogin(true)} variant="outline" className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link href={`${basePath}/subscribe`} className="text-blue-600 hover:underline font-medium">
                Subscribe to receive updates
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to link this donation to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowLogin(false)}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link href={`${basePath}/subscribe`} className="text-blue-600 hover:underline font-medium">
              Subscribe to follow and support
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
