"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const headersList = await headers()
  const host = headersList.get("host") || ""
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
  const origin = `${protocol}://${host}`

  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1")
  const redirectUrl = isLocalhost
    ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${origin}/auth/callback?next=/onboarding`
    : `${origin}/auth/callback?next=/onboarding`

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const data = {
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: formData.get("full_name") as string,
        subdomain: formData.get("subdomain") as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    // Email confirmation is required - user needs to check email
    redirect("/auth/check-email")
  }

  // Sign in worked - email confirmation is off, go to onboarding
  redirect("/onboarding")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function resendConfirmationEmail(email: string) {
  console.log("[v0] Resend confirmation email called for:", email)

  const supabase = await createClient()

  const headersList = await headers()
  const host = headersList.get("host") || ""
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
  const origin = `${protocol}://${host}`

  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1")
  const redirectUrl = isLocalhost
    ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${origin}/auth/callback?next=/onboarding`
    : `${origin}/auth/callback?next=/onboarding`

  console.log("[v0] Resend email redirect URL:", redirectUrl)
  console.log("[v0] Calling Supabase resend with type: signup")

  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  console.log("[v0] Supabase resend response:", { data, error })

  if (error) {
    console.log("[v0] Resend error:", error.message)
    return { error: error.message }
  }

  console.log("[v0] Resend success!")
  return { success: true }
}
