'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePlatformFee } from '@/app/actions/admin'

interface PlatformFeeSettingsProps {
  currentFee: number
  welcomeDiscount: number
  referralEnabled: boolean
}

export function PlatformFeeSettings({ currentFee, welcomeDiscount, referralEnabled }: PlatformFeeSettingsProps) {
  const [fee, setFee] = useState(currentFee.toString())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdate = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const newFee = parseFloat(fee)
      if (isNaN(newFee) || newFee < 0 || newFee > 10) {
        setMessage('Please enter a valid fee between 0 and 10')
        return
      }
      
      await updatePlatformFee(newFee)
      setMessage('Platform fee updated successfully')
    } catch (error) {
      setMessage('Failed to update platform fee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="platform-fee">Base Platform Fee (%)</Label>
        <div className="flex gap-2">
          <Input
            id="platform-fee"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update Fee'}
          </Button>
        </div>
        {message && (
          <p className={message.includes('success') ? 'text-green-600 text-sm' : 'text-destructive text-sm'}>
            {message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Welcome Discount</Label>
        <p className="text-sm text-muted-foreground">
          New tenants pay {welcomeDiscount}% for their first 30 days
        </p>
      </div>

      <div className="space-y-2">
        <Label>Referral Program</Label>
        <p className="text-sm text-muted-foreground">
          Status: {referralEnabled ? 'Enabled' : 'Disabled'}
        </p>
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-2">Revenue Breakdown</h3>
        <div className="text-sm space-y-1 text-muted-foreground">
          <div>• Platform fee: {currentFee}% of each donation</div>
          <div>• Optional tips: 10%, 15%, or 20% of donation amount</div>
          <div>• Stripe fee coverage: 2.9% + $0.30 per transaction</div>
        </div>
      </div>
    </div>
  )
}
