-- Add weshinn@gmail.com to super_admins table
-- This script finds the user by email and adds them if not already present

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'weshinn@gmail.com';
BEGIN
  -- Find the user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found in auth.users', v_email;
  ELSE
    -- Insert into super_admins if not already present
    INSERT INTO super_admins (user_id, email, full_name, created_at)
    VALUES (v_user_id, v_email, 'Wes Hinn', now())
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
    
    RAISE NOTICE 'Successfully added/updated super_admin for user % (%)', v_email, v_user_id;
  END IF;
END $$;
