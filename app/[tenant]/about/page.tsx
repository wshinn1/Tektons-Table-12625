import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { PersonSchema } from "@/components/seo/person-schema"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createServerClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("full_name, bio, profile_image_url")
    .eq("subdomain", subdomain)
    .single()

  if (!tenant) {
    return { title: "About - Not Found" }
  }

  const baseUrl = `https://${subdomain}.tektonstable.com`
  const description = tenant.bio || `Learn more about ${tenant.full_name}'s ministry and mission`

  return {
    title: `About ${tenant.full_name}`,
    description,
    alternates: {
      canonical: `${baseUrl}/about`,
    },
    openGraph: {
      title: `About ${tenant.full_name}`,
      description,
      url: `${baseUrl}/about`,
      siteName: tenant.full_name,
      images: tenant.profile_image_url
        ? [
            {
              url: tenant.profile_image_url,
              width: 1200,
              height: 630,
              alt: tenant.full_name,
            },
          ]
        : [],
      type: "profile",
    },
  }
}

export default async function TenantAboutPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createServerClient()

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant) {
    notFound()
  }

  // Fetch about content
  const { data: aboutContent } = await supabase.from("about_content").select("*").eq("tenant_id", tenant.id).single()

  const baseUrl = `https://${subdomain}.tektonstable.com`

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Added Person structured data for about page */}
      <PersonSchema
        name={tenant.full_name}
        url={baseUrl}
        image={tenant.profile_image_url}
        jobTitle="Missionary"
        description={tenant.bio}
      />

      <h1 className="text-4xl font-bold mb-6">About {tenant.full_name}</h1>

      <div className="space-y-8">
        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-4">{aboutContent?.mission_title || "Our Mission"}</h2>
          {aboutContent?.mission_image && (
            <div className="mb-6 relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden">
              <Image
                src={aboutContent.mission_image || "/placeholder.svg"}
                alt="Mission"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {aboutContent?.mission_content ||
                "This is a placeholder for your mission statement. You can edit this content from your admin dashboard to share your story and purpose with your supporters."}
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-4">{aboutContent?.story_title || "Our Story"}</h2>
          {aboutContent?.story_image && (
            <div className="mb-6 relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden">
              <Image src={aboutContent.story_image || "/placeholder.svg"} alt="Story" fill className="object-cover" />
            </div>
          )}
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {aboutContent?.story_content ||
                "Share your journey, calling, and the impact you're making. This section will help your supporters understand your work and connect with your mission."}
            </p>
          </div>
        </div>

        {/* Additional Sections */}
        {aboutContent?.additional_sections &&
          Array.isArray(aboutContent.additional_sections) &&
          aboutContent.additional_sections.map((section: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              {section.image && (
                <div className="mb-6 relative h-64 w-full rounded-lg overflow-hidden">
                  <Image src={section.image || "/placeholder.svg"} alt={section.title} fill className="object-cover" />
                </div>
              )}
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
              </div>
            </div>
          ))}

        {/* Optional Button */}
        {aboutContent?.button_text && aboutContent?.button_url && (
          <div className="flex justify-center pt-4">
            <Button asChild size="lg">
              <Link href={aboutContent.button_url}>{aboutContent.button_text}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
