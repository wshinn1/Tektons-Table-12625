"use server"

export async function getGrapesJSLicenseKey() {
  const key = process.env.GRAPESJS_LICENSE_KEY || ""
  console.log("[v0] GrapesJS License Key length:", key.length)
  console.log("[v0] GrapesJS License Key exists:", !!key)
  return key
}
