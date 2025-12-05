'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toggleReferralProgram } from '@/app/actions/admin-settings'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'

interface Props {
  isEnabled: boolean
  welcomeDiscount: number
}

export function ReferralProgramToggle({ isEnabled, welcomeDiscount }: Props) {
  const [enabled, setEnabled] = useState(isEnabled)
  const [showReasonForm, setShowReasonForm] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleToggle = (newValue: boolean) => {
    if (!newValue) {
      // Disabling - show reason form
      setShowReasonForm(true)
      setEnabled(false)
    } else {
      // Enabling - no reason needed
      handleSubmit(true, 'Re-enabling referral program')
    }
  }

  const handleSubmit = async (enableValue: boolean, reasonText: string) => {
    setLoading(true)
    const result = await toggleReferralProgram(enableValue, reasonText)
    
    if (result.success) {
      toast.success(`Referral program ${enableValue ? 'enabled' : 'disabled'}`)
      setEnabled(enableValue)
      setShowReasonForm(false)
      setReason('')
    } else {
      toast.error(result.error || 'Failed to update referral program')
      setEnabled(isEnabled) // Reset to original value
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>
          Enable or disable the referral discount program platform-wide
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Referral Program Status</Label>
            <p className="text-sm text-muted-foreground">
              Welcome discount: {welcomeDiscount.toFixed(2)}% for first 30 days
            </p>
          </div>
          <Switch 
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>

        {!enabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              When disabled, new missionaries will start at the full platform fee with no welcome discount.
              Existing referral relationships remain intact.
            </AlertDescription>
          </Alert>
        )}

        {showReasonForm && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label>Reason for Disabling</Label>
              <Textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the referral program is being disabled..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSubmit(false, reason)}
                disabled={!reason.trim() || loading}
                variant="destructive"
              >
                Confirm Disable
              </Button>
              <Button 
                onClick={() => {
                  setShowReasonForm(false)
                  setEnabled(true)
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
