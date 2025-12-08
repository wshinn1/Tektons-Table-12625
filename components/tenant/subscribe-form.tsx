"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { subscribeToTenant, loginAndFollowTenant } from "@/app/actions/supporter-auth"
import Link from "next/link"
import { Users, Mail, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SubscribeForm({
  tenantSlug,
  tenantName,
  subscriberCount,
  recentPostsCount,
  isSubdomain = false,
  groups = [],
}: {
  tenantSlug: string
  tenantName: string
  subscriberCount: number
  recentPostsCount: number
  isSubdomain?: boolean
  groups?: Array<{ id: string; name: string; description: string | null }>
}) {
  const router = useRouter()
  const basePath = isSubdomain ? "" : `/${tenantSlug}`
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [receiveEmails, setReceiveEmails] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<string>("followers")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginPassword, setLoginPassword] = useState("")
  const [existingUserEmail, setExistingUserEmail] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

      const result = await subscribeToTenant({
        email: email.trim(),
        password,
        fullName,
        receiveEmails,
        tenantSlug,
        groupId: selectedGroup === "followers" ? undefined : selectedGroup,
      })

      if (result.error) {
        if (result.error.includes("already exists") || result.error.includes("already been registered")) {
          setExistingUserEmail(email.trim())
          setShowLoginForm(true)
          setError("")
        } else {
          setError(result.error)
        }
      } else {
        router.push(`${basePath}/subscribe/success`)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLoginAndFollow = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginAndFollowTenant({
        email: existingUserEmail,
        password: loginPassword,
        tenantSlug,
        receiveEmails,
        groupId: selectedGroup === "followers" ? undefined : selectedGroup,
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push(`${basePath}/subscribe/success`)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (showLoginForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>You already have an account. Sign in to follow {tenantName}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginAndFollow} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="loginEmail">Email Address</Label>
                <Input id="loginEmail" type="email" value={existingUserEmail} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="receiveEmailsLogin"
                  checked={receiveEmails}
                  onCheckedChange={(checked) => setReceiveEmails(checked as boolean)}
                />
                <label
                  htmlFor="receiveEmailsLogin"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Receive email updates from {tenantName}
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In & Follow"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginForm(false)
                    setLoginPassword("")
                    setError("")
                  }}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
                <Link href={`${basePath}/auth/supporter-login`} className="text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Subscribe & Follow</CardTitle>
          <CardDescription>Create an account to receive updates and support {tenantName}</CardDescription>

          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {subscriberCount} {subscriberCount === 1 ? "follower" : "followers"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>
                {recentPostsCount} {recentPostsCount === 1 ? "post" : "posts"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubscribe} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>

            {groups.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="group">Subscribe to</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followers">General Updates</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGroup !== "followers" && groups.find((g) => g.id === selectedGroup)?.description && (
                  <p className="text-xs text-muted-foreground">
                    {groups.find((g) => g.id === selectedGroup)?.description}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="receiveEmails"
                checked={receiveEmails}
                onCheckedChange={(checked) => setReceiveEmails(checked as boolean)}
              />
              <label
                htmlFor="receiveEmails"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Receive email updates about new posts and ministry updates
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Subscribe & Follow"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href={`${basePath}/auth/supporter-login`} className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
