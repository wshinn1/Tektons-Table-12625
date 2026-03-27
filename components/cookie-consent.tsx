"use client"

import { useState, useEffect } from "react"

const COOKIE_KEY = "cookie-consent"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY)
    if (!stored) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted")
    document.cookie = `${COOKIE_KEY}=accepted; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
    setVisible(false)
    window.dispatchEvent(new Event("cookie-consent-accepted"))
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, "declined")
    document.cookie = `${COOKIE_KEY}=declined; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-gray-900 text-white px-4 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-gray-300">
          We use cookies and analytics to improve your experience and understand how our site is used.
          By clicking &quot;Accept&quot;, you consent to our use of analytics cookies.
          See our{" "}
          <a href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </a>{" "}
          for details.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm rounded-md border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm rounded-md bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY)
    setConsent(stored as "accepted" | "declined" | null)

    const handler = () => setConsent("accepted")
    window.addEventListener("cookie-consent-accepted", handler)
    return () => window.removeEventListener("cookie-consent-accepted", handler)
  }, [])

  return consent
}
