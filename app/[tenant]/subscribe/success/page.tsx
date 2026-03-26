import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail, Heart, BookOpen } from "lucide-react"
import { headers } from "next/headers"

export default async function SubscribeSuccessPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const headersList = await headers()
  const tenantSubdomain = headersList.get("x-tenant-subdomain") || ""
  const isSubdomain = tenantSubdomain === tenantSlug
  const basePath = isSubdomain ? "" : `/${tenantSlug}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Welcome to the Community!</CardTitle>
          <CardDescription>You're now subscribed and ready to stay connected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Check Your Email
            </h3>
            <p className="text-sm text-muted-foreground">
              We've sent you a welcome email with a link to the latest post. Be sure to check your inbox!
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">What's Next?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href={`${basePath}/blog`}
                className="inline-flex items-center justify-start h-auto py-4 px-4 border border-input bg-transparent rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Explore Posts</div>
                    <div className="text-sm text-muted-foreground font-normal">Read the latest updates</div>
                  </div>
                </div>
              </a>

              <a
                href={`${basePath}/giving`}
                className="inline-flex items-center justify-start h-auto py-4 px-4 border border-input bg-transparent rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Make a Donation</div>
                    <div className="text-sm text-muted-foreground font-normal">Support this missionary</div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t">
            <a
              href={`${basePath}/`}
              className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go to Homepage
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
