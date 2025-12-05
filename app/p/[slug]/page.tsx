import { getPublishedPageBySlug, getPageWithSections } from "@/app/actions/pages"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SectionRenderer } from "@/components/sections/section-renderer"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"

interface Props {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPublishedPageBySlug(slug)

  if (!page) {
    return { title: "Page Not Found" }
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
    keywords: page.meta_keywords || undefined,
  }
}

export default async function PlatformPage({ params }: Props) {
  const { slug } = await params
  const page = await getPublishedPageBySlug(slug)

  if (!page) {
    notFound()
  }

  // Render based on editor type
  if (page.editor_type === "unlayer") {
    return (
      <div className="min-h-screen flex flex-col">
        <MarketingNav />
        <main className="flex-1">
          {/* Render the exported HTML content from Unlayer */}
          <div className="unlayer-content" dangerouslySetInnerHTML={{ __html: page.html_content || "" }} />

          {/* Styles for Unlayer content */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .unlayer-content {
                  width: 100%;
                }
                .unlayer-content img {
                  max-width: 100%;
                  height: auto;
                }
                .unlayer-content a {
                  color: inherit;
                }
                .unlayer-content table {
                  max-width: 100%;
                }
                @media (max-width: 768px) {
                  .unlayer-content table,
                  .unlayer-content tbody,
                  .unlayer-content tr,
                  .unlayer-content td {
                    display: block !important;
                    width: 100% !important;
                  }
                }
              `,
            }}
          />
        </main>
        <MarketingFooter />
      </div>
    )
  }

  // For section-based pages, render using the section renderer
  const { sections } = await getPageWithSections(slug)

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">
        {sections && sections.length > 0 ? (
          sections.map((section: any) => (
            <SectionRenderer
              key={section.id}
              templateKey={section.section_templates?.template_key}
              props={section.props}
            />
          ))
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-muted-foreground">This page has no content yet.</p>
          </div>
        )}
      </main>
      <MarketingFooter />
    </div>
  )
}
