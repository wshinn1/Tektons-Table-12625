"use client"

import { useState } from "react"
import { startDonationCheckout } from "./path-to-your-function" // Adjust the path as necessary

const GivingForm = () => {
  const [selectedTier, setSelectedTier] = useState(null)
  const [donorEmail, setDonorEmail] = useState("")
  const [tipAmount, setTipAmount] = useState(0)
  const [tenantId, setTenantId] = useState("your-tenant-id") // Adjust the tenant ID as necessary
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDonateClick = async () => {
    if (!selectedTier) return

    setIsProcessing(true)
    console.log(
      "[v0] Starting donation checkout with amount:",
      selectedTier.amountInCents,
      "type:",
      selectedTier.recurring ? "monthly" : "once",
    )

    try {
      const sessionUrl = await startDonationCheckout(tenantId, selectedTier.id, donorEmail || undefined, tipAmount)

      // Redirect to Stripe Checkout
      if (sessionUrl) {
        window.location.href = sessionUrl
      }
    } catch (error) {
      console.error("Error starting checkout:", error)
      alert("Failed to start checkout. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <div>
      {/* ... existing JSX code ... */}
      <button onClick={handleDonateClick} disabled={isProcessing}>
        Donate
      </button>
    </div>
  )
}

export default GivingForm
