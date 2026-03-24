"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { submitTenantSupportRequest } from "@/app/actions/support"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import { emailsMatch } from "@/lib/utils"

export default function TenantHelpPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.tenant as string
  
  const [subject, setSubject] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user and tenant data
  const { data } = useSWR(`tenant-help-${subdomain}`, async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/${subdomain}/auth/login?redirect=/admin/help`)
      return null
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, name, email")
      .eq("subdomain", subdomain)
      .single()

    if (!tenant || !emailsMatch(tenant.email, user.email)) {
      router.push(`/${subdomain}`)
      return null
    }

    return { user, tenant }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!data?.user || !data?.tenant) return
    
    if (!subject.trim() || !details.trim()) {
      setError("Please fill in both fields.")
      return
    }

    setIsSubmitting(true)

    const result = await submitTenantSupportRequest({
      email: data.user.email!,
      name: data.tenant.name,
      subject: subject.trim(),
      details: details.trim(),
      tenantName: data.tenant.name,
      subdomain,
    })

    setIsSubmitting(false)

    if (result.success) {
      setIsSubmitted(true)
    } else {
      setError(result.error || "Something went wrong. Please try again.")
    }
  }

  if (isSubmitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold">Request Submitted</h2>
              <p className="text-muted-foreground">
                We've received your support request and will get back to you via email as soon as possible.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/${subdomain}/admin`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${subdomain}/admin`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Let us know what you need help with and we'll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="What do you need help with?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                placeholder="Please provide as much detail as possible..."
                rows={6}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
