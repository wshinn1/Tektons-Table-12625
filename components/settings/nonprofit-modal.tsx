'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Check } from 'lucide-react'

interface NonprofitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function NonprofitModal({ open, onOpenChange, onConfirm }: NonprofitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Stripe Nonprofit Discount Eligibility
          </DialogTitle>
          <DialogDescription className="text-base">
            Important information about nonprofit processing rates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Processing Rate Savings</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Standard Rate:</span>
                <span className="font-medium">2.9% + $0.30 per transaction</span>
              </div>
              <div className="flex justify-between">
                <span>Nonprofit Rate:</span>
                <span className="font-medium text-green-700">2.2% + $0.30 per transaction</span>
              </div>
              <div className="border-t border-blue-300 pt-2 flex justify-between font-semibold">
                <span>Savings:</span>
                <span className="text-green-700">0.7% per transaction</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Eligibility Requirements</h3>
            <p className="text-sm text-muted-foreground">
              To qualify for Stripe's nonprofit discount, your organization must:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Be a registered 501(c)(3) nonprofit organization in the United States</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Have your Stripe account configured with nonprofit status</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Provide verification documentation (EIN, 501(c)(3) determination letter)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Maintain active nonprofit status with the IRS</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Verification Required
            </h3>
            <p className="text-sm text-yellow-800">
              After checking this box, you'll need to submit your nonprofit documentation to our support team for verification. 
              The reduced rates will only apply after your nonprofit status is verified.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Check the box to indicate you are a 501(c)(3) nonprofit</li>
              <li>Contact support with your EIN and 501(c)(3) determination letter</li>
              <li>Wait for verification (typically 1-3 business days)</li>
              <li>Reduced rates will apply to all future transactions once verified</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            I Understand - Enable Nonprofit Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
