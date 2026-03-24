-- Check for duplicate users or any auth anomalies

-- 1. Check if there are any duplicate emails in auth.users
SELECT email, COUNT(*) as count
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. Check all auth users with the savefeedrestore email
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  confirmed_at,
  recovery_sent_at,
  raw_user_meta_data,
  deleted_at,
  banned_until
FROM auth.users
WHERE email ILIKE '%savefeedrestore%'
ORDER BY created_at;

-- 3. Check auth identities for savefeedrestore user
SELECT 
  i.id,
  i.user_id,
  i.identity_data,
  i.provider,
  i.last_sign_in_at,
  i.created_at,
  i.updated_at
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
WHERE u.email ILIKE '%savefeedrestore%';

-- 4. Check if there are any sessions for this user
SELECT 
  s.id,
  s.user_id,
  s.created_at,
  s.updated_at,
  s.factor_id,
  s.aal,
  s.not_after,
  s.refreshed_at,
  s.user_agent,
  s.ip
FROM auth.sessions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email ILIKE '%savefeedrestore%'
ORDER BY s.created_at DESC
LIMIT 10;

-- 5. Compare with wesshinn sessions
SELECT 
  s.id,
  s.user_id,
  s.created_at,
  s.updated_at,
  s.factor_id,
  s.aal,
  s.not_after,
  s.refreshed_at,
  s.user_agent,
  s.ip
FROM auth.sessions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email ILIKE '%wesshinn%'
ORDER BY s.created_at DESC
LIMIT 10;
