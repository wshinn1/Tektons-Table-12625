"use server"

export async function getGrapesJSLicenseKey() {
  return process.env.GRAPESJS_LICENSE_KEY || ""
}
