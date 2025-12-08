interface OrganizationSchemaProps {
  name: string
  url: string
  logo?: string
  description?: string
  foundingDate?: string
  email?: string
  sameAs?: string[]
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  foundingDate,
  email,
  sameAs = [],
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(foundingDate && { foundingDate }),
    ...(email && { email }),
    ...(sameAs.length > 0 && { sameAs }),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
