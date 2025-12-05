'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { updatePlatformFee } from '@/app/actions/admin-settings'
import { toast } from 'sonner'

interface Props {
  currentFee: number
  effectiveDate?: string
  tenantCount: number
}

export function PlatformFeeForm({ currentFee, effectiveDate, tenantCount }: Props) {
  const [newFee, setNewFee] = useState(currentFee.toString())
  const [applyToExisting, setApplyToExisting] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  
  const calculateImpact = () => {
    const oldFee = currentFee
    const newFeeNum = parseFloat(newFee)
    const difference = newFeeNum - oldFee
    const avgDonation = 100 // Assume $100 avg donation
    const avgMonthlyDonations = 10 // Assume 10 donations per tenant per month
    const monthlyImpact = tenantCount * avgMonthlyDonations * avgDonation * (difference / 100)
    
    return monthlyImpact.toFixed(2)
  }
  
  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the fee change')
      return
    }
    
    const newFeeNum = parseFloat(newFee)
    if (isNaN(newFeeNum) || newFeeNum < 0.5 || newFeeNum > 10) {
      toast.error('Fee must be between 0.5% and 10%')
      return
    }
    
    setLoading(true)
    const result = await updatePlatformFee({
      newFeePercentage: newFeeNum,
      applyToExisting,
      reason
    })
    
    if (result.success) {
      toast.success('Platform fee updated successfully')
      setReason('')
    } else {
      toast.error(result.error || 'Failed to update fee')
    }
    setLoading(false)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Fee Configuration</CardTitle>
        <CardDescription>Adjust the base platform fee percentage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Fee Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Current Platform Fee</div>
          <div className="text-3xl font-bold text-blue-600">{currentFee.toFixed(2)}%</div>
          {effectiveDate && (
            <div className="text-xs text-gray-500">
              Effective since {new Date(effectiveDate).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {/* Fee Adjustment Form */}
        <div className="space-y-4">
          <div>
            <Label>New Platform Fee (%)</Label>
            <Input 
              type="number" 
              min="0.5" 
              max="10" 
              step="0.1"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="3.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be between 0.5% and 10%
            </p>
          </div>
          
          <div>
            <Label>Reason for Change</Label>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Market adjustment, cost increase, etc."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="apply-existing"
              checked={applyToExisting}
              onCheckedChange={setApplyToExisting}
            />
            <Label htmlFor="apply-existing">
              Apply to existing tenants (otherwise only new signups)
            </Label>
          </div>
          
          {/* Impact Preview */}
          {parseFloat(newFee) !== currentFee && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Impact Preview</AlertTitle>
              <AlertDescription>
                This will affect <strong>{applyToExisting ? tenantCount : 'new'} tenant{applyToExisting && 's'}</strong>
                <br />
                Estimated monthly revenue change: <strong>${calculateImpact()}</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={loading || parseFloat(newFee) === currentFee}
        >
          {loading ? 'Updating...' : 'Update Platform Fee'}
        </Button>
      </CardContent>
    </Card>
  )
}
