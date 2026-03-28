"use client"

import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createStarterBlogPost } from "@/app/actions/blog"
import { notifyNewTenantCreated, sendTenantWelcomeEmail } from "@/app/actions/tenant-notifications"
import { addTenantToMoosend } from "@/lib/moosend"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form data
  const [missionOrganization, setMissionOrganization] = useState("")
  const [location, setLocation] = useState("")
  const [ministryFocus, setMinistryFocus] = useState("")
  const [bio, setBio] = useState("")
  const [language, setLanguage] = useState("en")
  const [isNonprofit, setIsNonprofit] = useState(false)
  const [fullName, setFullName] = useState("")
  const [subdomain, setSubdomain] = useState("")

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
      } else {
        setFullName(user.user_metadata?.full_name || "")
        setSubdomain(user.user_metadata?.subdomain || "")
      }
    }

    checkAuth()
  }, [router])

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleComplete = async () => {
    if (!fullName || !subdomain || !ministryFocus) {
      setError("Please fill out all required fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("No authenticated user found")

      console.log("[v0] Starting tenant creation")
      console.log("[v0] User ID:", user.id)
      console.log("[v0] User email:", user.email)
      console.log("[v0] Subdomain:", subdomain)

      const { data: existingSubdomain, error: subdomainCheckError } = await supabase
        .from("tenants")
        .select("id, subdomain")
        .eq("subdomain", subdomain)
        .maybeSingle()

      console.log("[v0] Subdomain check result:", existingSubdomain, subdomainCheckError)

      if (existingSubdomain && existingSubdomain.id !== user.id) {
        throw new Error("This subdomain is already taken. Please choose another.")
      }

      const { data: existingTenant, error: tenantCheckError } = await supabase
        .from("tenants")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      console.log("[v0] Existing tenant check:", existingTenant, tenantCheckError)

      let isNewTenant = false

      if (existingTenant) {
        console.log("[v0] Updating existing tenant")
        const updateData = {
          subdomain: subdomain,
          full_name: fullName,
          mission_organization: missionOrganization,
          location: location,
          ministry_focus: ministryFocus,
          bio: bio,
          onboarding_completed: true,
        }
        console.log("[v0] Update data:", updateData)

        const { error: updateError } = await supabase.from("tenants").update(updateData).eq("id", user.id)

        if (updateError) {
          console.error("[v0] Update error:", updateError)
          throw updateError
        }
      } else {
        console.log("[v0] Creating new tenant record")
        isNewTenant = true

        // Generate unique referral code based on full name
        const baseCode =
          fullName
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 3)
            .toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()

        const insertData = {
          id: user.id,
          subdomain: subdomain,
          full_name: fullName,
          email: user.email!,
          bio: bio || null,
          mission_organization: missionOrganization || null,
          location: location || null,
          ministry_focus: ministryFocus || null,
          referral_code: baseCode,
        }

        console.log("[v0] Insert data:", insertData)

        const { data: insertResult, error: tenantError } = await supabase.from("tenants").insert(insertData).select()

        console.log("[v0] Insert result:", insertResult)

        if (tenantError) {
          console.error("[v0] Tenant creation error:", tenantError)
          throw tenantError
        }

        // Add tenant to Moosend email list
        if (user.email) {
          addTenantToMoosend(user.email, fullName).catch(() => {})
        }
      }

      console.log("[v0] Tenant created/updated successfully")

      if (isNewTenant) {
        console.log("[v0] Creating starter blog post for new tenant")
        try {
          await createStarterBlogPost(user.id, fullName)
          console.log("[v0] Starter blog post created successfully")
        } catch (blogError) {
          console.error("[v0] Failed to create starter blog post:", blogError)
        }

        // Notify admin about new tenant
        try {
          await notifyNewTenantCreated({
            tenantName: fullName,
            subdomain: subdomain,
            email: user.email!,
            missionOrganization: missionOrganization || undefined,
            location: location || undefined,
            ministryFocus: ministryFocus || undefined,
          })
          console.log("[v0] New tenant notification email sent")
        } catch (emailError) {
          console.error("[v0] Failed to send new tenant notification:", emailError)
          // Don't block onboarding if email fails
        }

        try {
          await sendTenantWelcomeEmail({
            tenantName: fullName,
            subdomain: subdomain,
            email: user.email!,
          })
          console.log("[v0] Tenant welcome email sent")
        } catch (emailError) {
          console.error("[v0] Failed to send tenant welcome email:", emailError)
          // Don't block onboarding if email fails
        }
      }

      console.log("[v0] Onboarding complete, redirecting to tenant dashboard")

      const tenantAdminUrl = `https://${subdomain}.tektonstable.com/admin`
      console.log("[v0] Redirecting to:", tenantAdminUrl)
      window.location.href = tenantAdminUrl
    } catch (error: any) {
      console.error("[v0] Onboarding error:", error)
      setError(error.message || "Failed to complete setup. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Tektons Table</CardTitle>
            <CardDescription>Let's set up your missionary profile (Step {step} of 3)</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="missionOrganization">Mission Organization</Label>
                  <Input
                    id="missionOrganization"
                    type="text"
                    placeholder="e.g., OMF International, Wycliffe"
                    value={missionOrganization}
                    onChange={(e) => setMissionOrganization(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (Mission Field)</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Tokyo, Japan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ministryFocus">Ministry Focus</Label>
                  <Input
                    id="ministryFocus"
                    type="text"
                    placeholder="e.g., Church Planting, Bible Translation"
                    value={ministryFocus}
                    onChange={(e) => setMinistryFocus(e.target.value)}
                  />
                </div>
                <Button onClick={handleNext} className="w-full">
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="bio">Your Mission Story</Label>
                  <Textarea
                    id="bio"
                    placeholder="Share your calling and what God is doing through your ministry..."
                    rows={6}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed on your public fundraising page
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleBack} variant="outline">
                    Back
                  </Button>
                  <Button onClick={handleNext}>Continue</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <select
                    id="language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="pt">Portuguese (Português)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="it">Italian (Italiano)</option>
                    <option value="ru">Russian (Русский)</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="sw">Swahili (Kiswahili)</option>
                    <option value="tl">Tagalog</option>
                    <option value="ja">Japanese (日本語)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="ko">Korean (한국어)</option>
                    <option value="zh">Chinese (中文)</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Your supporters will see content in this language</p>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-1.5">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">Non-Profit Discount Available</p>
                      <p className="text-sm text-green-700 mt-1">
                        Registered 501(c)(3) nonprofits qualify for Stripe's reduced processing rates (2.2% + $0.30 vs
                        standard 2.9% + $0.30).
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        You can apply for the non-profit discount in your Settings after creating your account.
                      </p>
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleBack} variant="outline">
                    Back
                  </Button>
                  <Button onClick={handleComplete} disabled={isLoading}>
                    {isLoading ? "Setting up..." : "Complete Setup"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
