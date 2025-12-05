-- Add approval workflow fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS nonprofit_status TEXT DEFAULT 'none' CHECK (nonprofit_status IN ('none', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS nonprofit_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nonprofit_reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS nonprofit_rejection_reason TEXT;

-- Add comment explaining the workflow
COMMENT ON COLUMN tenants.nonprofit_status IS 'Approval status: none (not submitted), pending (awaiting review), approved (active), rejected (denied)';
COMMENT ON COLUMN tenants.nonprofit_submitted_at IS 'When the non-profit application was submitted for review';
COMMENT ON COLUMN tenants.nonprofit_reviewed_by IS 'Super admin who approved/rejected the application';
COMMENT ON COLUMN tenants.nonprofit_rejection_reason IS 'Reason provided if application was rejected';

-- Update existing is_registered_nonprofit to reflect approval status
-- This ensures backwards compatibility: nonprofit is only "active" when approved
UPDATE tenants 
SET nonprofit_status = CASE 
  WHEN is_registered_nonprofit = true THEN 'approved'
  ELSE 'none'
END
WHERE nonprofit_status = 'none';
