-- Sync all existing tenants to contact groups
DO $$
DECLARE
  tenant_record RECORD;
  tenant_contact_id UUID;
  all_tenants_group_id UUID;
BEGIN
  -- Get the "All Tenants" group ID
  SELECT id INTO all_tenants_group_id 
  FROM contact_groups 
  WHERE name = 'All Tenants' AND is_system = TRUE;

  -- Loop through all tenants
  FOR tenant_record IN SELECT id, full_name, email FROM tenants LOOP
    -- Insert or update contact
    INSERT INTO contacts (first_name, last_name, email, source)
    VALUES (
      COALESCE(SPLIT_PART(tenant_record.full_name, ' ', 1), tenant_record.full_name),
      COALESCE(NULLIF(SUBSTRING(tenant_record.full_name FROM POSITION(' ' IN tenant_record.full_name) + 1), ''), ''),
      tenant_record.email,
      'tenant'
    )
    ON CONFLICT (email) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW()
    RETURNING id INTO tenant_contact_id;

    -- Add to "All Tenants" group
    IF all_tenants_group_id IS NOT NULL AND tenant_contact_id IS NOT NULL THEN
      INSERT INTO contact_group_members (contact_id, group_id)
      VALUES (tenant_contact_id, all_tenants_group_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
