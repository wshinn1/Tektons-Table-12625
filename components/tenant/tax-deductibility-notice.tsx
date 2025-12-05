import { CheckCircle2, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TaxDeductibilityNoticeProps {
  isRegisteredNonprofit: boolean
  nonprofitName?: string | null
  nonprofitEin?: string | null
  tenantName: string
  variant?: "inline" | "card"
}

export function TaxDeductibilityNotice({
  isRegisteredNonprofit,
  nonprofitName,
  nonprofitEin,
  tenantName,
  variant = "card",
}: TaxDeductibilityNoticeProps) {
  if (!isRegisteredNonprofit) {
    return null
  }

  if (variant === "inline") {
    return (
      <div className="text-sm border rounded-lg p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-green-700 dark:text-green-400">Tax-deductible donation</span>
            <p className="mt-1 text-xs text-green-800 dark:text-green-300">
              This donation may be tax-deductible. You will receive a receipt from{" "}
              <span className="font-medium">{nonprofitName || tenantName}</span>
              {nonprofitEin && ` (EIN: ${nonprofitEin})`} for your tax records.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Alert className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="text-lg font-semibold mb-2 text-green-800 dark:text-green-300">
            Tax-Deductible Donation
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p className="text-green-800 dark:text-green-300">
              Your donation may be tax-deductible as it is being made to <strong>{nonprofitName || tenantName}</strong>,
              a registered 501(c)(3) organization
              {nonprofitEin && ` (EIN: ${nonprofitEin})`}.
            </p>
            <div className="flex items-center gap-2 text-sm bg-green-100 dark:bg-green-900/30 p-3 rounded-md mt-3">
              <FileText className="h-4 w-4 text-green-700 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-300">
                You will receive an official tax receipt directly from the organization for your records.
              </span>
            </div>
            <p className="text-xs text-green-700/70 dark:text-green-400/70 mt-3">
              Please consult with your tax advisor to determine eligibility for tax deduction based on your specific
              circumstances.
            </p>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
