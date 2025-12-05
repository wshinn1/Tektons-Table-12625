'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { verifyNonprofit, rejectNonprofit } from '@/app/actions/nonprofit-verification'

interface NonprofitVerificationActionsProps {
  tenantId: string
  tenantEmail: string
}

export function NonprofitVerificationActions({ tenantId, tenantEmail }: NonprofitVerificationActionsProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!confirm('Are you sure you want to verify this nonprofit status?')) return
    
    setLoading(true)
    const result = await verifyNonprofit(tenantId, notes || 'Approved after document review')
    
    if (result.success) {
      toast.success('Nonprofit status verified')
      window.location.reload()
    } else {
      toast.error(result.error || 'Failed to verify')
    }
    setLoading(false)
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    
    if (!confirm('Are you sure you want to reject this nonprofit application?')) return
    
    setLoading(true)
    const result = await rejectNonprofit(tenantId, notes)
    
    if (result.success) {
      toast.success('Nonprofit application rejected')
      window.location.reload()
    } else {
      toast.error(result.error || 'Failed to reject')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      {!showNotes ? (
        <>
          <Button onClick={handleVerify} disabled={loading} size="sm">
            Approve
          </Button>
          <Button onClick={() => setShowNotes(true)} variant="outline" size="sm">
            Reject
          </Button>
        </>
      ) : (
        <>
          <Textarea
            placeholder="Reason for rejection..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="text-sm"
          />
          <Button onClick={handleReject} disabled={loading} variant="destructive" size="sm">
            Confirm Rejection
          </Button>
          <Button onClick={() => setShowNotes(false)} variant="outline" size="sm">
            Cancel
          </Button>
        </>
      )}
    </div>
  )
}
