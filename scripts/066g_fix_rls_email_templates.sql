-- Fix RLS performance for email_templates table

DROP POLICY IF EXISTS "Tenants can manage own email templates" ON email_templates;
CREATE POLICY "Tenants can manage own email templates" ON email_templates
  FOR ALL USING (tenant_id = (select auth.uid()));
