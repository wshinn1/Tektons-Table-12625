-- Sync all existing tenants to the contacts table
-- This handles tenants that existed before the trigger was created

INSERT INTO contacts (first_name, last_name, email, source, created_at)
SELECT 
  COALESCE(SPLIT_PART(full_name, ' ', 1), full_name) as first_name,
  COALESCE(NULLIF(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1), ''), '') as last_name,
  email,
  'tenant' as source,
  created_at
FROM tenants
WHERE NOT EXISTS (
  SELECT 1 FROM contacts WHERE contacts.email = tenants.email
);

-- Add all synced tenants to the "All Tenants" group
INSERT INTO contact_group_members (contact_id, group_id)
SELECT 
  c.id,
  cg.id
FROM contacts c
CROSS JOIN contact_groups cg
WHERE cg.name = 'All Tenants' 
  AND cg.is_system = TRUE
  AND c.source = 'tenant'
  AND NOT EXISTS (
    SELECT 1 FROM contact_group_members cgm 
    WHERE cgm.contact_id = c.id AND cgm.group_id = cg.id
  );

COMMENT ON TABLE contacts IS 'Synced all existing tenants to contacts table with trigger for future updates';
