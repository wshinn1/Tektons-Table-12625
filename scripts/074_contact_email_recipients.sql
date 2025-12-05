-- Add email recipients configuration for tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS contact_email_recipients TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN tenants.contact_email_recipients IS 'Additional email addresses to receive contact form submissions';
