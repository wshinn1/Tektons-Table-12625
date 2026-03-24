-- Check for case mismatch between tenant email and auth email for both tenants

SELECT 
  t.subdomain,
  t.email as tenant_email,
  au.email as auth_email,
  t.email = au.email as exact_match,
  LOWER(t.email) = LOWER(au.email) as case_insensitive_match,
  LENGTH(t.email) as tenant_email_length,
  LENGTH(au.email) as auth_email_length,
  -- Show hex encoding to reveal any hidden characters
  encode(t.email::bytea, 'hex') as tenant_email_hex,
  encode(au.email::bytea, 'hex') as auth_email_hex
FROM tenants t
JOIN auth.users au ON LOWER(au.email) = LOWER(t.email)
WHERE t.subdomain IN ('wesshinn', 'savefeedrestore');

-- Also check for any whitespace or special characters
SELECT 
  t.subdomain,
  t.email as tenant_email,
  au.email as auth_email,
  TRIM(t.email) = TRIM(au.email) as trimmed_match,
  -- Check for leading/trailing spaces
  t.email LIKE ' %' OR t.email LIKE '% ' as tenant_has_spaces,
  au.email LIKE ' %' OR au.email LIKE '% ' as auth_has_spaces
FROM tenants t
JOIN auth.users au ON LOWER(TRIM(au.email)) = LOWER(TRIM(t.email))
WHERE t.subdomain IN ('wesshinn', 'savefeedrestore');
