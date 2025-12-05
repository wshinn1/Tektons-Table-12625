-- Add weshinn@gmail.com as super admin
-- User ID: ec02fe71-1e84-4d67-84f4-aeda989da556

-- Add error checking to verify user exists in auth.users before inserting
DO $$
DECLARE
  user_exists boolean;
  user_email text;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = 'ec02fe71-1e84-4d67-84f4-aeda989da556'
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User with ID ec02fe71-1e84-4d67-84f4-aeda989da556 does not exist in auth.users. Please sign up at /auth/signup first.';
  END IF;
  
  -- Get the user's email to verify
  SELECT email INTO user_email FROM auth.users WHERE id = 'ec02fe71-1e84-4d67-84f4-aeda989da556';
  RAISE NOTICE 'Found user with email: %', user_email;
  
  -- Insert super admin record
  INSERT INTO super_admins (user_id, email, full_name)
  VALUES (
    'ec02fe71-1e84-4d67-84f4-aeda989da556',
    'weshinn@gmail.com',
    'Wes Hinn'
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = now();
  
  RAISE NOTICE 'Successfully added weshinn@gmail.com as super admin';
END $$;
