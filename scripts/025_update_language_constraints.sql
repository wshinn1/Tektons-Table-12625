-- Add language support for 14 languages

-- Check if language_preference column exists, if not add it
DO $$ 
BEGIN
  -- Add language_preference to tenants if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='tenants' AND column_name='language_preference'
  ) THEN
    -- If old 'language' column exists, rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='tenants' AND column_name='language'
    ) THEN
      ALTER TABLE tenants RENAME COLUMN language TO language_preference;
    ELSE
      -- Otherwise create new column
      ALTER TABLE tenants ADD COLUMN language_preference TEXT DEFAULT 'en';
    END IF;
  END IF;

  -- Add language_preference to supporters if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='supporters' AND column_name='language_preference'
  ) THEN
    ALTER TABLE supporters ADD COLUMN language_preference TEXT DEFAULT 'en';
  END IF;
END $$;

-- Drop existing constraints
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_language_check;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_language_preference_check;
ALTER TABLE supporters DROP CONSTRAINT IF EXISTS supporters_language_preference_check;

-- Add new constraints with all 14 supported languages
ALTER TABLE tenants 
ADD CONSTRAINT tenants_language_preference_check 
CHECK (language_preference IN ('en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'sw', 'tl', 'ja', 'hi', 'ko', 'zh'));

ALTER TABLE supporters 
ADD CONSTRAINT supporters_language_preference_check 
CHECK (language_preference IN ('en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'sw', 'tl', 'ja', 'hi', 'ko', 'zh'));

-- Update any NULL language preferences to 'en' (English) as default
UPDATE tenants SET language_preference = 'en' WHERE language_preference IS NULL;
UPDATE supporters SET language_preference = 'en' WHERE language_preference IS NULL;

-- Add comments documenting the supported languages
COMMENT ON COLUMN tenants.language_preference IS 'User language preference: en=English, es=Spanish, pt=Portuguese, fr=French, de=German, it=Italian, ru=Russian, ar=Arabic, sw=Swahili, tl=Tagalog, ja=Japanese, hi=Hindi, ko=Korean, zh=Chinese';
COMMENT ON COLUMN supporters.language_preference IS 'Supporter language preference: en=English, es=Spanish, pt=Portuguese, fr=French, de=German, it=Italian, ru=Russian, ar=Arabic, sw=Swahili, tl=Tagalog, ja=Japanese, hi=Hindi, ko=Korean, zh=Chinese';
