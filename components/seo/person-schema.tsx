interface PersonSchemaProps {
  name: string
  url?: string
  image?: string
  jobTitle?: string
  description?: string
  sameAs?: string[]
}

export function PersonSchema({ name, url, image, jobTitle, description, sameAs = [] }: PersonSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(url && { url }),
    ...(image && { image }),
    ...(jobTitle && { jobTitle }),
    ...(description && { description }),
    ...(sameAs.length > 0 && { sameAs }),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
