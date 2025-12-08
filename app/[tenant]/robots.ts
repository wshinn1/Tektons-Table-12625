import type { MetadataRoute } from "next"
import { headers } from "next/headers"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get("host") || ""

  // Extract subdomain
  const parts = host.split(".")
  let subdomain = ""

  if (host.includes("tektonstable.com") && parts.length >= 3 && parts[0] !== "www") {
    subdomain = parts[0]
  } else if (host.includes("localhost") && parts.length > 1) {
    subdomain = parts[0]
  }

  if (!subdomain || subdomain === "www" || subdomain === "tektonstable") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  const baseUrl = `https://${subdomain}.tektonstable.com`

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/", "/api/", "/donor/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
